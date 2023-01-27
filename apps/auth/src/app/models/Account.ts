import mongoose from 'mongoose';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken, TAccount } from '../types/TAccount';

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

accountSchema.methods.getToken = getToken;
accountSchema.methods.setToken = setToken;
accountSchema.methods.unsetToken = unsetToken;

export const Account = mongoose.model<AccountDocument>('Account', accountSchema);
