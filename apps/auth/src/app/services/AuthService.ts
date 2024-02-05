import { Request } from 'express';
import { Account, AccountDocument } from '../models/Account';
import { toChecksumAddress } from 'web3-utils';
import { SUCCESS_SIGNUP_COMPLETED } from '../util/messages';
import { TInteraction, AccountVariant, TToken } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, AccountPlanType } from '@thxnetwork/types/enums';
import bcrypt from 'bcrypt';
import { AccountService } from './AccountService';
import { Token } from '../models/Token';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { oidc } from '@thxnetwork/auth/util/oidc';
import { hubspot } from '@thxnetwork/auth/util/hubspot';
import { DASHBOARD_URL } from '@thxnetwork/auth/config/secrets';
import { MailService } from './MailService';
import { accountVariantProviderMap } from '@thxnetwork/common/lib/types/maps/oauth';
import TokenService from './TokenService';

export default class AuthService {
    static findAccountForSession(session: { accountId: string }) {
        return Account.findById(session.accountId);
    }

    static findAccountForEmail(email: string) {
        return Account.findOne({ email: email.toLowerCase() });
    }

    static async findAccountForToken(variant: AccountVariant, tokenInfo: Partial<{ userId: string }>) {
        const kind = accountVariantProviderMap[variant];
        const token = await TokenService.findTokenForUserId(tokenInfo.userId, kind);
        if (!token) return;

        return await Account.findById(token.sub);
    }

    static async findAccountForAddress(address: string) {
        const checksummedAddress = toChecksumAddress(address);
        const account = await Account.findOne({ address: checksummedAddress });
        if (account) return account;
        return await Account.create({
            variant: AccountVariant.Metamask,
            plan: AccountPlanType.Free,
            address,
        });
    }

    static async signin(
        interaction: TInteraction,
        tokenInfo: Partial<TToken>,
        variant: AccountVariant,
        email?: string,
    ) {
        let account: AccountDocument;
        const { session, params } = interaction;

        // Find account for active session
        if (session && session.accountId) {
            account = await this.findAccountForSession(session);
        }
        // Find account for email
        else if (email) {
            account = await this.findAccountForEmail(email);
        }
        // Find account for userId
        else if (tokenInfo) {
            account = await this.findAccountForToken(variant, tokenInfo);
        }

        // If no match, create the account
        if (!account) {
            account = await AccountService.create({
                variant,
                email,
                plan: params.signup_plan,
            });
        }

        // Store token for account
        await TokenService.setToken(account, tokenInfo);

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

    static async redirectOTP(req: Request, email: string) {
        const { params } = req.interaction;
        let account = await this.findAccountForEmail(email);

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

        return req;
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
