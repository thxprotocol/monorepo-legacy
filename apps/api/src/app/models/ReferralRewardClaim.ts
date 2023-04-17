import mongoose from 'mongoose';
import { TReferralRewardClaim } from '@thxnetwork/types/';

export type ReferralRewardClaimDocument = mongoose.Document & TReferralRewardClaim;

const schema = new mongoose.Schema(
    {
        referralRewardId: String,
        sub: { type: String, index: 'hashed' },
        uuid: String,
        amount: String,
        isApproved: Boolean,
        poolId: String,
        metadata: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ReferralRewardClaim = mongoose.model<ReferralRewardClaimDocument>('ReferralRewardClaims', schema);
