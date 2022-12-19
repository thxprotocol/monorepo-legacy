import Web3 from 'web3';
import { IAccessToken, IAccountUpdates } from '../types/TAccount';
import { Account, AccountDocument } from '../models/Account';
import { createRandomToken } from '../util/tokens';
import { decryptString } from '../util/decrypt';
import { SECURE_KEY } from '../config/secrets';
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
import { AccountPlanType } from '../types/enums/AccountPlanType';
import { AccountVariant } from '../types/enums/AccountVariant';
import { AccessTokenKind } from '../types/enums/AccessTokenKind';

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

        account.address =
            updates.address || account.address ? toChecksumAddress(updates.address || account.address) : undefined;

        if (updates.googleAccess === false) {
            await YouTubeService.revokeAccess(account);
            await account.unsetToken(AccessTokenKind.Google);
        }

        if (updates.twitterAccess === false) {
            await account.unsetToken(AccessTokenKind.Twitter);
        }

        if (updates.githubAccess === false) {
            await account.unsetToken(AccessTokenKind.Github);
        }

        if (updates.twitchAccess === false) {
            await account.unsetToken(AccessTokenKind.Twitch);
        }

        if (updates.discordAccess === false) {
            await account.unsetToken(AccessTokenKind.Discord);
        }
        console.log(await account.save());
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
            const token = {
                kind: AccessTokenKind.Signup,
                accessToken: createRandomToken(),
                expiry: DURATION_TWENTYFOUR_HOURS,
            } as IAccessToken;
            account.setToken(token);
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
        const account = await Account.findOne({
            'tokens.kind': AccessTokenKind.Signup,
            'tokens.accessToken': signupToken,
        });

        if (!account) {
            return { error: ERROR_SIGNUP_TOKEN_INVALID };
        }

        const token: IAccessToken = account.getToken(AccessTokenKind.Signup);
        if (token.expiry < Date.now()) {
            return { error: ERROR_SIGNUP_TOKEN_EXPIRED };
        }

        account.setToken({ kind: AccessTokenKind.Signup, expiry: null, accessToken: '' } as IAccessToken);
        account.active = true;
        account.isEmailVerified = true;

        await account.save();

        return { result: SUCCESS_SIGNUP_COMPLETED, account };
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

        account.setToken({ kind: AccessTokenKind.VerifyEmail, expiry: null, accessToken: '' } as IAccessToken);
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
        // const account: AccountDocument = await Account.findOne({ authenticationToken })
        //     .where('authenticationTokenExpires')
        //     .gt(Date.now())
        //     .exec();

        const account = await Account.findOne({
            'tokens.kind': AccessTokenKind.Auth,
            'tokens.expiry': { $gt: Date.now() },
        });

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
        // const account: AccountDocument = await Account.findOne({ passwordResetToken })
        //     .where('passwordResetExpires')
        //     .gt(Date.now())
        //     .exec();
        const account = await Account.findOne({
            'tokens.kind': AccessTokenKind.PasswordReset,
            'tokens.expiry': { $gt: Date.now() },
        });

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
