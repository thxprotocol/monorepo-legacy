import mongoose from 'mongoose';

export type IdentityDocument = mongoose.Document & TIdentity;

export const Identity = mongoose.model<IdentityDocument>(
    'Identity',
    new mongoose.Schema(
        {
            poolId: String,
            uuid: { unique: true, type: String },
            sub: String,
        },
        { timestamps: true },
    ),
    'identity',
);
