import mongoose from 'mongoose';
import { TPoolTransfer } from '@thxnetwork/api/types/TPoolTransfer';

export type PoolTransferDocument = mongoose.Document & TPoolTransfer;

const schema = new mongoose.Schema(
    {
        uuid: String,
        sub: String,
        poolId: String,
        token: String,
        expiry: Date,
    },
    { timestamps: true },
);

export const PoolTransfer = mongoose.model<PoolTransferDocument>('pooltransfers', schema);
