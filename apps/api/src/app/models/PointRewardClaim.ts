import { TPointRewardClaim } from '@thxnetwork/types/interfaces/PointRewardClaim';
import mongoose from 'mongoose';

export type PointRewardClaimDocument = mongoose.Document & TPointRewardClaim;

const schema = new mongoose.Schema(
    {
        pointRewardId: String,
        sub: { type: String, index: 'hashed' },
        walletId: { type: String, index: 'hashed' },
        amount: Number,
        poolId: String,
        platformUserId: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const PointRewardClaim = mongoose.model<PointRewardClaimDocument>(
    'PointRewardClaim',
    schema,
    'pointrewardclaims',
);
