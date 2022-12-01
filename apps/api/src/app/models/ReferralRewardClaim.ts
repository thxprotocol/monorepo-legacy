import mongoose from 'mongoose';
import { TReferralRewardClaim } from '@thxnetwork/types/';

export type ReferralRewardClaimDocument = mongoose.Document & TReferralRewardClaim;

const schema = new mongoose.Schema(
    {
        referralRewardId: String,
        sub: String,
        uuid: String,
    },
    { timestamps: true },
);

export const ReferralRewardClaim = mongoose.model<ReferralRewardClaimDocument>('ReferralRewardClaims', schema);
