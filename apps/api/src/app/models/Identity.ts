import mongoose from 'mongoose';

export type TIdentity = {
    poolId: string;
    uuid: string;
};

export type IdentityDocument = mongoose.Document & TIdentity;

const identitySchema = new mongoose.Schema(
    {
        poolId: String,
        uuid: String,
    },
    { timestamps: true },
);

export const Identity = mongoose.model<IdentityDocument>('Identity', identitySchema, 'identities');
