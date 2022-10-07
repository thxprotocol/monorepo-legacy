import newrelic from 'newrelic';
import Web3 from 'web3';
import { IAccountUpdates } from '../types/TAccount';
import { Account, AccountDocument } from '../models/Account';
import { createRandomToken } from '../util/tokens';
import { decryptString } from '../util/decrypt';
import { SECURE_KEY } from '../util/secrets';
import { checkPasswordStrength } from '../util/passwordcheck';
import { toChecksumAddress } from 'web3-utils';
import {
    ERROR_NO_ACCOUNT,
    DURATION_TWENTYFOUR_HOURS,
    ERROR_SIGNUP_TOKEN_INVALID,
    ERROR_SIGNUP_TOKEN_EXPIRED,
    SUCCESS_SIGNUP_COMPLETED,
    ERROR_AUTHENTICATION_TOKEN_INVALID_OR_EXPIRED,
    ERROR_PASSWORD_NOT_MATCHING,
    ERROR_PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED,
    ERROR_PASSWORD_STRENGTH,
    ERROR_VERIFY_EMAIL_TOKEN_INVALID,
    ERROR_VERIFY_EMAIL_EXPIRED,
} from '../util/messages';
import { YouTubeService } from './YouTubeService';
import { logger } from '../util/logger';
import { AccountPlanType } from '../types/enums/AccountPlanType';
import { AccountVariant } from '../types/enums/AccountVariant';
export class AccountService {
    static get(sub: string) {
        return Account.findById(sub);
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

    static async update(
        account: AccountDocument,
        {
            acceptTermsPrivacy,
            acceptUpdates,
            address,
            privateKey,
            googleAccess,
            twitterAccess,
            spotifyAccess,
            authenticationToken,
            authenticationTokenExpires,
            lastLoginAt,
            organisation,
            firstName,
            profileImg,
            lastName,
            plan,
            email,
        }: IAccountUpdates,
    ) {
        if (email) {
            account.email = email;
        }
        // No strict checking here since null == undefined
        if (account.acceptTermsPrivacy == null) {
            account.acceptTermsPrivacy = acceptTermsPrivacy == null ? false : account.acceptTermsPrivacy;
        } else {
            account.acceptTermsPrivacy = acceptTermsPrivacy || account.acceptTermsPrivacy;
        }

        if (organisation) {
            account.organisation = organisation;
        }

        if (firstName) {
            account.firstName = firstName;
        }

        if (lastName) {
            account.lastName = lastName;
        }

        if (lastLoginAt) {
            account.lastLoginAt = lastLoginAt;
        }

        if (profileImg) {
            account.profileImg = profileImg;
        }

        if (plan) {
            if (account.plan === AccountPlanType.Free) {
                // await MailService.
            }
            account.plan = plan;
        }
        // No strict checking here since null == undefined
        if (account.acceptUpdates == null) {
            account.acceptUpdates = acceptUpdates == null ? false : account.acceptUpdates;
        } else {
            account.acceptUpdates = acceptUpdates || account.acceptTermsPrivacy;
        }

        account.authenticationToken = authenticationToken || account.authenticationToken;
        account.authenticationTokenExpires = authenticationTokenExpires || account.authenticationTokenExpires;
        account.address = address || account.address ? toChecksumAddress(address || account.address) : undefined;
        account.privateKey = privateKey || account.privateKey;

        if (googleAccess === false) {
            try {
                await YouTubeService.revokeAccess(account);
            } catch (error) {
                newrelic.noticeError(error);
                logger.error('Unable to revoke YouTube access', error);
            }
            account.googleAccessToken = '';
            account.googleRefreshToken = '';
            account.googleAccessTokenExpires = null;
        }

        if (twitterAccess === false) {
            account.twitterAccessToken = '';
            account.twitterRefreshToken = '';
            account.twitterAccessTokenExpires = null;
        }

        if (spotifyAccess === false) {
            account.spotifyAccessToken = '';
            account.spotifyRefreshToken = '';
            account.spotifyAccessTokenExpires = null;
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
            acceptTermsPrivacy: true,
            acceptUpdates: false,
            plan: AccountPlanType.Free,
            active: true,
        });
    }

    static async signup(data: {
        email?: string;
        password: string;
        variant: AccountVariant;
        acceptTermsPrivacy: boolean;
        acceptUpdates: boolean;
        active?: boolean;
        twitterId?: string;
    }) {
        let account;
        if (data.email) {
            account = await Account.findOne({ email: data.email, active: false });
        } else if (data.twitterId) {
            account = await Account.findOne({ twitterId: data.twitterId });
        }

        if (!account) {
            account = new Account();
        }

        account.active = data.active;
        account.email = data.email;
        account.variant = data.variant;
        account.password = data.password;
        account.acceptTermsPrivacy = data.acceptTermsPrivacy || false;
        account.acceptUpdates = data.acceptUpdates || false;
        account.plan = AccountPlanType.Free;
        account.twitterId = data.twitterId;

        if (!data.active) {
            account.signupToken = createRandomToken();
            account.signupTokenExpires = DURATION_TWENTYFOUR_HOURS;
        }

        return account;
    }

    static async invite(email: string, password: string, address?: string) {
        const wallet = new Web3().eth.accounts.create();
        const privateKey = address ? null : wallet.privateKey;
        const account = new Account({
            active: true,
            address: address ? address : wallet.address,
            privateKey: address ? privateKey : wallet.privateKey,
            email,
            password,
            plan: AccountPlanType.Free,
        });

        return await account.save();
    }

    static async verifySignupToken(signupToken: string) {
        const account = await Account.findOne({ signupToken });

        if (!account) {
            return { error: ERROR_SIGNUP_TOKEN_INVALID };
        }

        if (account.signupTokenExpires < Date.now()) {
            return { error: ERROR_SIGNUP_TOKEN_EXPIRED };
        }

        account.signupToken = '';
        account.signupTokenExpires = null;
        account.active = true;
        account.isEmailVerified = true;

        await account.save();

        return { result: SUCCESS_SIGNUP_COMPLETED, account };
    }

    static async verifyEmailToken(verifyEmailToken: string) {
        const account = await Account.findOne({ verifyEmailToken });

        if (!account) {
            return { error: ERROR_VERIFY_EMAIL_TOKEN_INVALID };
        }

        if (account.verifyEmailTokenExpires < Date.now()) {
            return { error: ERROR_VERIFY_EMAIL_EXPIRED };
        }

        account.verifyEmailToken = '';
        account.verifyEmailTokenExpires = null;
        account.isEmailVerified = true;

        await account.save();

        return { result: SUCCESS_SIGNUP_COMPLETED, account };
    }

    static async getSubForAuthenticationToken(
        password: string,
        passwordConfirm: string,
        authenticationToken: string,
        secureKey: string,
    ) {
        const account: AccountDocument = await Account.findOne({ authenticationToken })
            .where('authenticationTokenExpires')
            .gt(Date.now())
            .exec();

        if (!account) {
            throw new Error(ERROR_AUTHENTICATION_TOKEN_INVALID_OR_EXPIRED);
        }

        if (password !== passwordConfirm) {
            throw new Error(ERROR_PASSWORD_NOT_MATCHING);
        }

        const oldPassword = decryptString(secureKey, SECURE_KEY.split(',')[0]);

        account.privateKey = decryptString(account.privateKey, oldPassword);
        account.password = password;

        await account.save();

        return account._id.toString();
    }

    static async signinWithEmailPassword(email: string, password: string) {
        const account: AccountDocument = await Account.findOne({ email });
        if (!account) throw new Error(ERROR_NO_ACCOUNT);
        if (!account.comparePassword(password)) {
            throw new Error(ERROR_PASSWORD_NOT_MATCHING);
        }

        return account;
    }

    static async getSubForPasswordResetToken(password: string, passwordConfirm: string, passwordResetToken: string) {
        const account: AccountDocument = await Account.findOne({ passwordResetToken })
            .where('passwordResetExpires')
            .gt(Date.now())
            .exec();
        const passwordStrength = checkPasswordStrength(password);
        if (!account) {
            throw new Error(ERROR_PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED);
        }
        if (passwordStrength != 'strong') {
            throw new Error(ERROR_PASSWORD_STRENGTH);
        }
        if (password !== passwordConfirm) {
            throw new Error(ERROR_PASSWORD_NOT_MATCHING);
        }
        account.password = password;

        await account.save();

        return account._id.toString();
    }

    static remove(id: string) {
        Account.remove({ _id: id });
    }

    static async post(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        signupToken: string,
        signupTokenExpires: number,
    ) {
        try {
            const account = new Account({
                firstName,
                lastName,
                email,
                password,
                signupToken,
                signupTokenExpires,
            });

            await account.save();
        } catch (error) {
            return { error };
        }
    }

    static async count() {
        try {
            return await Account.countDocuments();
        } catch (error) {
            return { error };
        }
    }
}
