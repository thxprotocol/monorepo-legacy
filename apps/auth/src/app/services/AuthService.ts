import { Request, Response } from 'express';
import { Account, AccountDocument } from '../models/Account';
import { SUCCESS_SIGNUP_COMPLETED } from '../util/messages';
import { AccessTokenKind, AccountVariant, AccountPlanType, OAuthRequiredScopes } from '@thxnetwork/common/enums';
import bcrypt from 'bcrypt';
import { AccountService } from './AccountService';
import { Token } from '../models/Token';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { oidc } from '@thxnetwork/auth/util/oidc';
import { hubspot } from '@thxnetwork/auth/util/hubspot';
import { DASHBOARD_URL } from '@thxnetwork/auth/config/secrets';
import { MailService } from './MailService';
import TokenService from './TokenService';
import EthereumService from './EthereumService';

export default class AuthService {
    static async connect(interaction: TInteraction, tokenInfo: Partial<TToken>, variant: AccountVariant) {
        let account: AccountDocument;
        const { session, params } = interaction;

        // Find account for active session
        if (session && session.accountId) {
            account = await AccountService.findAccountForSession(session);
        }

        // Find account for userId
        else if (tokenInfo) {
            account = await AccountService.findAccountForToken(variant, tokenInfo);
        }

        // If no match, create the account
        if (!account) {
            account = await AccountService.create({ variant, plan: params.signup_plan });
        }

        // Connect token to account
        await TokenService.connect(account, tokenInfo);

        return account;
    }

    static async signup(data: { email?: string; plan: AccountPlanType; variant: AccountVariant; active: boolean }) {
        let account: AccountDocument;

        if (data.email) {
            account = await Account.findOne({ email: data.email, active: false });
        }

        if (!account) {
            account = await AccountService.create({
                email: data.email,
                plan: data.plan,
            });
        }

        account.active = data.active;
        account.email = data.email;
        account.variant = data.variant;
        account.plan = data.plan;

        return await account.save();
    }

    static async redirectSSO(_req: Request, res: Response, { uid, variant }: { uid: string; variant: AccountVariant }) {
        const map = {
            [AccountVariant.SSOGoogle]: {
                kind: AccessTokenKind.Google,
                scopes: OAuthRequiredScopes.GoogleAuth,
            },
            [AccountVariant.SSODiscord]: {
                kind: AccessTokenKind.Discord,
                scopes: OAuthRequiredScopes.DiscordAuth,
            },
            [AccountVariant.SSOTwitter]: {
                kind: AccessTokenKind.Twitter,
                scopes: OAuthRequiredScopes.TwitterAuth,
            },
            [AccountVariant.SSOTwitch]: {
                kind: AccessTokenKind.Twitch,
                scopes: OAuthRequiredScopes.TwitchAuth,
            },
            [AccountVariant.SSOGithub]: {
                kind: AccessTokenKind.Github,
                scopes: OAuthRequiredScopes.GithubAuth,
            },
        };
        const { kind, scopes } = map[variant];

        const url = TokenService.getLoginURL({ uid, kind, scopes });

        return res.redirect(url);
    }
    static async redirectWalletConnect(
        req: Request,
        res: Response,
        { message, signature }: { message: string; signature: string },
    ) {
        // If signed auth request is available recover the address from the signature and lookup user
        if (!message || !signature) {
            throw new UnauthorizedError('Signed message and signature are required for Metamask login.');
        }

        const address = EthereumService.recoverSigner(decodeURIComponent(message), signature);
        if (!address) throw new UnauthorizedError('Could not recover address from signed message.');

        const account = await AccountService.findAccountForAddress(address);
        if (!account) throw new UnauthorizedError('Account not found or created.');

        return await oidc.interactionFinished(req, res, { login: { accountId: String(account._id) } });
    }
    static async redirectOTP(req: Request, res: Response, { email }: { email: string }) {
        const { params } = req.interaction;
        let account = await AccountService.findAccountForEmail(email);

        // Create and return account if none found the given email
        if (!account) {
            const variant = AccountVariant.EmailPassword;
            const plan = params.signup_plan ? Number(params.signup_plan) : AccountPlanType.Free;

            account = await AccountService.create({ email, plan, variant });
        }

        // Send email using SES
        await MailService.sendOTPMail(account);

        // Store the sub in the interaction so we can lookup the hashed OTP later
        req.interaction.params.sub = String(account._id);
        req.interaction.params.email = email;

        // Interaction TTL is set to 10min and will expire after
        await req.interaction.save(Date.now() + 10 * 60 * 1000);

        const redirectURL = `/oidc/${req.params.uid}/signin/otp`;

        return res.redirect(redirectURL);
    }

    static async isOTPValid(account: AccountDocument, otp: string): Promise<boolean> {
        const token = await TokenService.getToken(account, AccessTokenKind.Auth);
        if (!token) return;
        return await bcrypt.compare(otp, token.accessToken);
    }

    static async verifyEmailToken(verifyEmailToken: string) {
        const token = await Token.findOne({
            kind: AccessTokenKind.VerifyEmail,
            accessTokenEncrypted: verifyEmailToken,
        });
        if (!token) return { error: 'Verification request not found.' };
        if (token && token.expiry < Date.now()) return { error: 'Verification request is expired.' };

        const account = await Account.findById(token.sub);
        if (!account) return { error: 'Account not found' };

        await TokenService.unsetToken(account, AccessTokenKind.VerifyEmail);

        await Account.findByIdAndUpdate(account._id, { isEmailVerified: true });

        return { result: SUCCESS_SIGNUP_COMPLETED, account };
    }

    static async redirectCallback(req: Request) {
        // Get code from url
        const code = req.query.code as string;
        // Throw error if not exists
        if (!code) throw new UnauthorizedError('Could not find code in query');

        const stateBase64String = req.query.state as string;
        const stateSerialized = Buffer.from(stateBase64String, 'base64').toString();
        const { uid } = JSON.parse(stateSerialized);

        // Throw if no uid is present in state object
        if (!uid) throw new UnauthorizedError('Could not find uid in state object');

        // See if interaction still exists and throw if not
        const interaction = await oidc.Interaction.find(uid);
        if (!interaction) throw new UnauthorizedError('Your session has expired.');

        return { interaction, code };
    }

    static async getReturn(interaction, account: AccountDocument) {
        if (!account) throw new UnauthorizedError('Could not find or create an account');

        // Update interaction with login state
        interaction.result = { login: { accountId: String(account._id) } };
        await interaction.save(Date.now() + 10000);

        return await this.getReturnUrl(account, interaction);
    }

    static async getReturnUrl(
        account: AccountDocument,
        { params, returnTo, prompt }: { params: any; returnTo: string; prompt: any },
    ) {
        let returnUrl = returnTo;
        // Connect prompts already have a session and will therefor not continue the
        // regular auth signin flow used during SSO
        if (prompt && prompt.name === 'connect') {
            returnUrl = params.display === 'popup' ? params.redirect_uri : params.return_url;
        }

        // No matter the session state params.return_url will redirect to the client app
        if (params.return_url && params.return_url.startsWith(DASHBOARD_URL)) {
            hubspot.upsert({ email: account.email, plan: account.plan });
        }

        return returnUrl;
    }
}
