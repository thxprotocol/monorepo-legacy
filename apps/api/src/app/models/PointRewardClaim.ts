import { TPointRewardClaim } from '@thxnetwork/types/interfaces/PointRewardClaim';
import mongoose from 'mongoose';

export type PointRewardClaimDocument = mongoose.Document & TPointRewardClaim;

const pointRewardClaimSchema = new mongoose.Schema(
    {
        pointRewardId: String,
        sub: String,
        amount: String,
        poolId: String,
    },
    { timestamps: true },
);

export const PointRewardClaim = mongoose.model<PointRewardClaimDocument>(
    'PointRewardClaim',
    pointRewardClaimSchema,
    'pointrewardclaims',
);
