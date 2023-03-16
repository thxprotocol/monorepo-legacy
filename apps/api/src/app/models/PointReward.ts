import { TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import mongoose from 'mongoose';
import { rewardBaseSchema } from './ERC20Perk';

export type PointRewardDocument = mongoose.Document & TPointReward;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: Number,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const PointReward = mongoose.model<PointRewardDocument>('PointReward', schema, 'pointrewards');
