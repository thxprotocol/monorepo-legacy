import mongoose from 'mongoose';
import { TMilestoneRewardClaim } from '@thxnetwork/types/';

export type MilestoneRewardClaimDocument = mongoose.Document & TMilestoneRewardClaim;

const schema = new mongoose.Schema(
    {
        milestoneRewardId: String,
        sub: String,
        uuid: String,
        amount: String,
        isClaimed: Boolean,
    },
    { timestamps: true },
);

export const MilestoneRewardClaim = mongoose.model<MilestoneRewardClaimDocument>('MilestoneRewardClaims', schema);
