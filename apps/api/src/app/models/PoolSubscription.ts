import { TPoolSubscription } from '@thxnetwork/types/interfaces/PoolSubscription';
import mongoose from 'mongoose';

export type PoolSubscriptionDocument = mongoose.Document & TPoolSubscription;

const schema = new mongoose.Schema(
    {
        sub: { type: String, unique: true },
        poolId: { type: String, unique: true },
    },
    { timestamps: true },
);

schema.index({ sub: 1, poolId: 1 });

export const PoolSubscription = mongoose.model<PoolSubscriptionDocument>('PoolSubscription', schema);
