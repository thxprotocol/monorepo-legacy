import mongoose from 'mongoose';
import { TIdentity } from '@thxnetwork/common/lib/types/interfaces/Identity';

export type IdentityDocument = mongoose.Document & TIdentity;

const identitySchema = new mongoose.Schema(
    {
        poolId: String,
        uuid: String,
        sub: String,
    },
    { timestamps: true },
);

export const Identity = mongoose.model<IdentityDocument>('Identity', identitySchema, 'identities');
