import mongoose from 'mongoose';
import { TMilestoneRewardClaim } from '@thxnetwork/types/';

export type MilestoneRewardClaimDocument = mongoose.Document & TMilestoneRewardClaim;

const schema = new mongoose.Schema(
    {
        questId: String,
        sub: { type: String, index: 'hashed' },
        uuid: String,
        amount: Number,
        isClaimed: Boolean,
        poolId: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const MilestoneRewardClaim = mongoose.model<MilestoneRewardClaimDocument>('MilestoneRewardClaims', schema);
