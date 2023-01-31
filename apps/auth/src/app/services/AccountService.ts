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

function getKindFromVariant(variant: AccountVariant): AccessTokenKind {
    switch (variant) {
        case AccountVariant.SSOGoogle:
            return AccessTokenKind.Google;
        case AccountVariant.SSOTwitter:
            return AccessTokenKind.Twitter;
        case AccountVariant.SSOGithub:
            return AccessTokenKind.Github;
        case AccountVariant.SSODiscord:
            return AccessTokenKind.Discord;
        case AccountVariant.SSOTwitch:
            return AccessTokenKind.Twitch;
    }
}
export class AccountService {
    static get(sub: string) {
        return Account.findById(sub);
    }

    static getByDiscordId(discordId: string) {
        return Account.findOne({ discordId });
    }

    static getByEmail(email: string) {
        return Account.findOne({ email });
    }

    static getByAddress(address: string) {
        return Account.findOne({ address });
    }

    static getByTwitterId(twitterId: string) {
        return Account.findOne({ twitterId });
    }

    static async isActiveUserByEmail(email: string) {
        return await Account.exists({ email, active: true });
    }

    static async update(account: AccountDocument, updates: IAccountUpdates) {
        if (updates.email) {
            account.email = updates.email;
        }
        // No strict checking here since null == undefined
        if (account.acceptTermsPrivacy == null) {
            account.acceptTermsPrivacy = updates.acceptTermsPrivacy == null ? false : account.acceptTermsPrivacy;
        } else {
            account.acceptTermsPrivacy = updates.acceptTermsPrivacy || account.acceptTermsPrivacy;
        }

        if (updates.organisation) {
            account.organisation = updates.organisation;
        }

        if (updates.firstName) {
            account.firstName = updates.firstName;
        }

        if (updates.lastName) {
            account.lastName = updates.lastName;
        }

        if (updates.lastLoginAt) {
            account.lastLoginAt = updates.lastLoginAt;
        }

        if (updates.profileImg) {
            account.profileImg = updates.profileImg;
        }

        if (updates.discordId) {
            account.discordId = updates.discordId;
        }

        if (updates.plan) {
            account.plan = updates.plan;
        }

        if (account.acceptUpdates == null) {
            account.acceptUpdates = updates.acceptUpdates == null ? false : account.acceptUpdates;
        } else {
            account.acceptUpdates = updates.acceptUpdates || account.acceptTermsPrivacy;
        }

        if (updates.authenticationToken || updates.authenticationTokenExpires) {
            account.setToken({
                kind: AccessTokenKind.Auth,
                accessToken: updates.authenticationToken,
                expiry: updates.authenticationTokenExpires,
            });
        }

        if (updates.address) {
            account.address = toChecksumAddress(updates.address);
        }

        if (updates.googleAccess === false) {
            YouTubeService.revokeAccess(account, AccessTokenKind.Google);
            account.unsetToken(AccessTokenKind.Google);
        }

        if (updates.youtubeViewAccess === false) {
            YouTubeService.revokeAccess(account, AccessTokenKind.YoutubeView);
            account.unsetToken(AccessTokenKind.YoutubeView);
        }

        if (updates.youtubeManageAccess === false) {
            YouTubeService.revokeAccess(account, AccessTokenKind.YoutubeManage);
            account.unsetToken(AccessTokenKind.YoutubeManage);
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

        await account.save();
    }

    static async signinWithAddress(addr: string) {
        const address = toChecksumAddress(addr);
        const account = await Account.findOne({ address });
        if (account) return account;

        return await Account.create({
            address,
            variant: AccountVariant.Metamask,
            acceptTermsPrivacy: true,
            acceptUpdates: true,
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
            // Map AccountVariant to AccessTokenKind and search for userId in tokenInfo
            const kind = getKindFromVariant(variant);
            account = await Account.findOne({ 'tokens.userId': tokenInfo.userId, 'tokens.kind': kind });
        }

        // When no account is matched, create the account.
        if (!account) {
            account = await Account.create({
                email,
                variant,
                acceptTermsPrivacy: true,
                acceptUpdates: true,
                plan: AccountPlanType.Basic,
                active: true,
            });
        }

        // Always udpate latest tokenInfo for account
        account.setToken(tokenInfo);

        return await account.save();
    }

    static async signup(data: { email?: string; variant: AccountVariant; active: boolean; twitterId?: string }) {
        let account: AccountDocument;

        if (data.email) {
            account = await Account.findOne({ email: data.email, active: false });
        } else if (data.twitterId) {
            account = await Account.findOne({ twitterId: data.twitterId });
        }

        if (!account) {
            account = new Account({
                email: data.email,
                active: data.active,
                variant: data.variant,
                acceptTermsPrivacy: true,
                acceptUpdates: true,
                plan: AccountPlanType.Basic,
            });
        }

        account.active = data.active;
        account.email = data.email;
        account.variant = data.variant;
        account.acceptTermsPrivacy = true;
        account.acceptUpdates = true;
        account.plan = AccountPlanType.Basic;
        account.twitterId = data.twitterId;

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
}
