import mongoose from 'mongoose';
import { encryptString } from '../util/encrypt';
import { SECURE_KEY } from '../config/secrets';
import { decryptString } from '../util/decrypt';

export type TokenDocument = mongoose.Document & TToken;

const tokenSchema = new mongoose.Schema(
    {
        sub: String,
        kind: String,
        accessTokenEncrypted: String,
        refreshTokenEncrypted: String,
        expiry: Number,
        userId: String,
        scopes: [String],
        metadata: Object,
    },
    { timestamps: true },
);

tokenSchema.pre(['save', 'findOneAndUpdate'], function (next) {
    const accessToken = this.get('accessToken');
    const refreshToken = this.get('refreshToken');
    if (accessToken) {
        const accessTokenEncrypted = encryptString(accessToken, SECURE_KEY);
        this.set('accessTokenEncrypted', accessTokenEncrypted);
    }
    if (refreshToken) {
        const refreshTokenEncrypted = encryptString(refreshToken, SECURE_KEY);
        this.set('refreshTokenEncrypted', refreshTokenEncrypted);
    }
    next();
});

tokenSchema.virtual('accessToken').get(function () {
    return this.accessTokenEncrypted && decryptString(this.accessTokenEncrypted, SECURE_KEY);
});

tokenSchema.virtual('refreshToken').get(function () {
    return this.refreshTokenEncrypted && decryptString(this.refreshTokenEncrypted, SECURE_KEY);
});

export const Token = mongoose.model<TokenDocument>('Token', tokenSchema, 'tokens');
