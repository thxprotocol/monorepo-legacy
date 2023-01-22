import bcrypt from 'bcrypt-nodejs';
import mongoose from 'mongoose';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken, TAccount } from '../types/TAccount';
import { encryptString } from '../util/encrypt';

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
        otpSecret: String,
        twitterId: String,
        acceptTermsPrivacy: Boolean,
        acceptUpdates: Boolean,
        lastLoginAt: Date,
        tokens: [{ kind: String, accessToken: String, refreshToken: String, expiry: Number, userId: String }],
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

const getToken = function (kind: AccessTokenKind): IAccessToken {
    return this.tokens.find((x: IAccessToken) => x.kind === kind);
};

const unsetToken = function (kind: AccessTokenKind) {
    const index = this.tokens.findIndex((x: IAccessToken) => x.kind === kind);
    if (index < 0) return;
    this.tokens.splice(index, 1);
};

const setToken = async function (data: IAccessToken) {
    const index = this.tokens.findIndex((x: IAccessToken) => x.kind === data.kind);
    if (index < 0) {
        this.tokens.push(data);
    } else {
        this.tokens[index] = { ...this.tokens[index], ...data };
    }
};

accountSchema.methods.comparePassword = comparePassword;
accountSchema.methods.getToken = getToken;
accountSchema.methods.setToken = setToken;
accountSchema.methods.unsetToken = unsetToken;

export const Account = mongoose.model<AccountDocument>('Account', accountSchema);
