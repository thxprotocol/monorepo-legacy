import mongoose from 'mongoose';
import { TDailyRewardClaim } from '@thxnetwork/types/';

export type DailyRewardClaimDocument = mongoose.Document & TDailyRewardClaim;

const schema = new mongoose.Schema(
    {
        questId: String,
        sub: String,
        uuid: String,
        amount: Number,
        poolId: String,
        state: Number,
        ip: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const DailyRewardClaim = mongoose.model<DailyRewardClaimDocument>('DailyRewardClaims', schema);
