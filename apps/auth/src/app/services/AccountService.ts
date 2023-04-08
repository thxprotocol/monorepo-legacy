import { IAccessToken, IAccountUpdates } from '../types/TAccount';
import { Account, AccountDocument } from '../models/Account';
import { toChecksumAddress } from 'web3-utils';
import {
    SUCCESS_SIGNUP_COMPLETED,
    ERROR_VERIFY_EMAIL_TOKEN_INVALID,
    ERROR_VERIFY_EMAIL_EXPIRED,
} from '../util/messages';
import { YouTubeService } from './YouTubeService';
import { AccountPlanType } from '../types/enums/AccountPlanType';
import { AccountVariant } from '../types/enums/AccountVariant';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import bcrypt from 'bcrypt';
import { ShopifyService } from './ShopifyService';
import { logger } from '../util/logger';
import { ForbiddenError } from '../util/errors';
// import { SignTypedDataVersion, recoverTypedSignature } from '@metamask/eth-sig-util';

export class AccountService {
    static async get(sub: string) {
        return await Account.findById(sub);
    }

    static async getMany(subs: string[]) {
        if (!subs.length) return [];
        return await Account.find({ _id: { $in: subs } });
    }

    static getByDiscordId(discordId: string) {
        return Account.findOne({ 'tokens.userId': discordId });
    }

    static getByEmail(email: string) {
        return Account.findOne({ email });
    }

    static getByAddress(address: string) {
        return Account.findOne({ address });
    }

    static async update(account: AccountDocument, updates: IAccountUpdates) {
        account.email = updates.email || account.email;
        account.profileImg = updates.profileImg || account.profileImg;
        account.firstName = updates.firstName || account.firstName;
        account.lastName = updates.lastName || account.lastName;
        account.plan = updates.plan || account.plan;
        account.organisation = updates.organisation || account.organisation;
        account.address = updates.address ? toChecksumAddress(updates.address) : account.address;
        account.acceptUpdates = updates.acceptUpdates === null ? false : account.acceptUpdates;

        if (updates.profileImg) {
            account.profileImg = updates.profileImg;
        }

        if (updates.discordId) {
            account.discordId = updates.discordId;
        }

        if (updates.plan) {
            account.plan = updates.plan;
        }

        if (updates.website) {
            try {
                account.website = updates.website ? new URL(updates.website).hostname : account.website;
            } catch {
                // no-op
            }
        }

        // if (updates.authRequestMessage && updates.authRequestSignature) {
        //     const address = recoverTypedSignature({
        //         data: JSON.parse(updates.authRequestMessage),
        //         signature: updates.authRequestSignature,
        //         version: 'V3' as SignTypedDataVersion,
        //     });
        //     account.address = address || account.address;
        // }

        if (updates.googleAccess === false) {
            const token = account.getToken(AccessTokenKind.Google);
            if (token) {
                await YouTubeService.revokeAccess(account, token);
                account.unsetToken(AccessTokenKind.Google);
            }
        }

        if (updates.youtubeViewAccess === false) {
            const token = account.getToken(AccessTokenKind.YoutubeView);
            if (token) {
                await YouTubeService.revokeAccess(account, token);
                account.unsetToken(AccessTokenKind.YoutubeView);
            }
        }

        if (updates.youtubeManageAccess === false) {
            const token = account.getToken(AccessTokenKind.YoutubeManage);
            if (token) {
                await YouTubeService.revokeAccess(account, token);
                account.unsetToken(AccessTokenKind.YoutubeManage);
            }
        }

        if (updates.twitterAccess === false) {
            account.unsetToken(AccessTokenKind.Twitter);
        }

        if (updates.githubAccess === false) {
            account.unsetToken(AccessTokenKind.Github);
        }

        if (updates.twitchAccess === false) {
            account.unsetToken(AccessTokenKind.Twitch);
        }

        if (updates.discordAccess === false) {
            account.unsetToken(AccessTokenKind.Discord);
            account.discordId = null;
        }

        if (updates.shopifyAccess === false) {
            const token = account.getToken(AccessTokenKind.Shopify);
            try {
                await ShopifyService.revokeAccess(account.shopifyStoreUrl, token.accessToken);
            } catch (error) {
                logger.error(error);
            } finally {
                account.shopifyStoreUrl = undefined;
                account.unsetToken(AccessTokenKind.Shopify);
            }
        }

        return await account.save();
    }

    static async signinWithAddress(addr: string) {
        const address = toChecksumAddress(addr);
        const account = await Account.findOne({ address });
        if (account) return account;

        return await Account.create({
            address,
            variant: AccountVariant.Metamask,
            plan: AccountPlanType.Basic,
            active: true,
        });
    }

    static async findOrCreate(
        session: { accountId: string },
        tokenInfo: IAccessToken,
        variant: AccountVariant,
        email?: string,
    ) {
        let account: AccountDocument;

        // Find account for active session
        if (session && session.accountId) {
            account = await Account.findById(session.accountId);
        }
        // Find account for email
        else if (email) {
            account = await Account.findOne({ email });
        }
        // Find account for userId
        else if (tokenInfo.userId) {
            account = await Account.findOne({ 'tokens.userId': tokenInfo.userId, 'tokens.kind': tokenInfo.kind });
        }

        // When no account is matched, create the account.
        if (!account) {
            const isEmailVerified = this.getIsEmailVerified(variant, email);
            const data = { variant, plan: AccountPlanType.Basic, active: true, isEmailVerified };
            if (email) {
                data['email'] = email;
            }
            account = await Account.create(data);
        }

        // Always udpate latest tokenInfo for account
        account.setToken(tokenInfo);

        return await account.save();
    }

    private static getIsEmailVerified(accountVariant: AccountVariant, email?: string): undefined | boolean {
        if (!email) {
            return undefined;
        }

        const ssoVariants = [
            AccountVariant.SSODiscord,
            AccountVariant.SSOGoogle,
            AccountVariant.SSOTwitter,
            AccountVariant.SSOGithub,
            AccountVariant.SSODiscord,
            AccountVariant.SSOTwitch,
        ];
        if (ssoVariants.includes(accountVariant)) {
            return true;
        }
        return false;
    }

    static async signup(data: { email?: string; variant: AccountVariant; active: boolean }) {
        let account: AccountDocument;

        if (data.email) {
            account = await Account.findOne({ email: data.email, active: false });
        }

        if (!account) {
            account = new Account({
                email: data.email,
                active: data.active,
                variant: data.variant,
                plan: AccountPlanType.Basic,
                isEmailVerified: this.getIsEmailVerified(data.variant, data.email),
            });
        }

        account.active = data.active;
        account.email = data.email;
        account.variant = data.variant;
        account.plan = AccountPlanType.Basic;

        return await account.save();
    }

    static async isOTPValid(account: AccountDocument, otp: string): Promise<boolean> {
        const token = account.getToken(AccessTokenKind.Auth);
        if (!token) return;

        return await bcrypt.compare(otp, token.accessToken);
    }

    static async verifyEmailToken(verifyEmailToken: string) {
        const account = await Account.findOne({
            'tokens.kind': AccessTokenKind.VerifyEmail,
            'tokens.accessToken': verifyEmailToken,
        });

        if (!account) {
            return { error: ERROR_VERIFY_EMAIL_TOKEN_INVALID };
        }

        const token: IAccessToken = account.getToken(AccessTokenKind.VerifyEmail);
        if (token.expiry < Date.now()) {
            return { error: ERROR_VERIFY_EMAIL_EXPIRED };
        }

        account.unsetToken(AccessTokenKind.VerifyEmail);
        account.isEmailVerified = true;

        await account.save();

        return { result: SUCCESS_SIGNUP_COMPLETED, account };
    }

    static remove(id: string) {
        Account.remove({ _id: id });
    }

    static async count() {
        try {
            return await Account.countDocuments();
        } catch (error) {
            return { error };
        }
    }

    static isConnected = async (sub: string, userId: string, tokenKind: AccessTokenKind) => {
        const isConnected = await Account.exists({
            'tokens.kind': tokenKind,
            'tokens.userId': userId,
            '_id': { $ne: sub },
        });

        if (isConnected) {
            throw new ForbiddenError('This account is already connected to a different user.');
        }
    };
}
