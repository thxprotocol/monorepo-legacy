import mongoose from 'mongoose';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';
import { encryptString } from '../util/encrypt';
import { SECURE_KEY } from '../config/secrets';

export type TokenDocument = mongoose.Document & {
    sub: string;
    variant: AccessTokenKind;
    accessToken: string;
    refreshToken: string;
    expiry: string;
    userId: string;
    metadata: string;
};

const tokenSchema = new mongoose.Schema(
    {
        sub: String,
        variant: Number,
        accessToken: String,
        refreshToken: String,
        expiry: Number,
        userId: String,
        metadata: String,
    },
    { timestamps: false },
);

// Pre-save hook to encrypt sensitive data
tokenSchema.pre<TokenDocument>('save', function (next) {
    try {
        this.accessToken = encryptString(this.accessToken, SECURE_KEY);
        this.refreshToken = encryptString(this.accessToken, SECURE_KEY);
        next();
    } catch (err) {
        next(err);
    }
});

export const Token = mongoose.model<TokenDocument>('Token', tokenSchema, 'tokens');
