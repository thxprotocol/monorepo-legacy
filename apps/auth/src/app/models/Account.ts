import bcrypt from 'bcrypt-nodejs';
import mongoose from 'mongoose';
import { AccessTokenKind } from '../types/enums/AccessTokenKind';
import { IAccessToken, TAccount } from '../types/TAccount';
import { encryptString } from '../util/encrypt';
import { NotFoundError } from '../util/errors';

export type AccountDocument = mongoose.Document & TAccount;

const accountSchema = new mongoose.Schema(
    {
        active: Boolean,
        isEmailVerified: Boolean,
        firstName: String,
        lastName: String,
        profileImg: String,
        organisation: String,
        plan: Number,
        // email.sparse allows the value to be null and unique if defined
        email: { type: String, unique: true, sparse: true },
        password: String,
        // address.sparse allows the value to be null and unique if defined
        address: { type: String, unique: true, sparse: true },
        walletAddress: { type: String, unique: true, sparse: true },
        variant: Number,
        privateKey: String,
        //signupToken: String,
        otpSecret: String,
        //signupTokenExpires: Date,
        //authenticationToken: String,
        //authenticationTokenExpires: Date,
        //passwordResetToken: String,
        //passwordResetExpires: Date,
        // googleAccessToken: String,
        // googleRefreshToken: String,
        //googleAccessTokenExpires: Number,
        // twitterAccessToken: String,
        // twitterRefreshToken: String,
        // twitterAccessTokenExpires: Number,
        twitterId: String,
        githubAccessToken: String,
        githubRefreshToken: String,
        githubAccessTokenRefresh: Number,
        verifyEmailToken: String,
        verifyEmailTokenExpires: Number,
        acceptTermsPrivacy: Boolean,
        acceptUpdates: Boolean,
        lastLoginAt: Date,
        tokens: [{ kind: String, accessToken: String, refreshToken: String, expiry: Number }],
    },
    { timestamps: true },
);

/**
 * Password hash middleware.
 */
accountSchema.pre('save', function save(next) {
    const account = this as any as AccountDocument;

    if (!account.isModified('password')) {
        return next();
    }

    if (account.privateKey) {
        account.privateKey = encryptString(account.privateKey, account.password);
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(account.password, salt, undefined, (err: mongoose.Error, hash) => {
            if (err) {
                return next(err);
            }
            account.password = hash;
            next();
        });
    });
});

const comparePassword = function (candidatePassword: string) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

const getToken = function (tokenKind: AccessTokenKind): IAccessToken {
    return this.tokens.find((x: IAccessToken) => x.kind === tokenKind);
};

const createToken = function (token: IAccessToken) {
    const index = this.tokens.findIndex((x: IAccessToken) => x.kind === token.kind);
    if (index >= 0) {
        this.tokens[index] = token;
    } else {
        this.tokens.push(token);
    }
};

const updateToken = function (
    kind: AccessTokenKind,
    updates: { accessToken?: string; refreshToken?: string; expiry?: number },
) {
    const index = this.tokens.findIndex((x: IAccessToken) => x.kind === kind);
    if (index < 0) {
        throw new NotFoundError();
    }
    const token: IAccessToken = this.tokens[index];
    token.accessToken = updates.accessToken || token.accessToken;
    token.refreshToken = updates.refreshToken || token.refreshToken;
    token.expiry = updates.expiry || token.expiry;
    this.tokens[index] = token;
};

accountSchema.methods.comparePassword = comparePassword;
accountSchema.methods.getToken = getToken;
accountSchema.methods.createToken = createToken;
accountSchema.methods.updateToken = updateToken;

export const Account = mongoose.model<AccountDocument>('Account', accountSchema);
