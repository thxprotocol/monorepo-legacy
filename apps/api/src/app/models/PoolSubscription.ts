import { TPoolSubscription } from '@thxnetwork/types/interfaces/PoolSubscription';
import mongoose from 'mongoose';

export type PoolSubscriptionDocument = mongoose.Document & TPoolSubscription;

const schema = new mongoose.Schema(
    {
        sub: { type: String },
        poolId: { type: String },
    },
    { timestamps: true },
);

schema.index({ sub: 1, poolId: 1 }, { unique: true });

export const PoolSubscription = mongoose.model<PoolSubscriptionDocument>('PoolSubscription', schema);
