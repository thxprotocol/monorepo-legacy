import mongoose from 'mongoose';
import { TDailyRewardClaim } from '@thxnetwork/types/';

export type DailyRewardClaimDocument = mongoose.Document & TDailyRewardClaim;

const schema = new mongoose.Schema(
    {
        dailyRewardId: String,
        sub: { type: String, index: 'hashed' },
        uuid: String,
        amount: String,
        poolId: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const DailyRewardClaim = mongoose.model<DailyRewardClaimDocument>('DailyRewardClaims', schema);
