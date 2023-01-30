import mongoose from 'mongoose';
import { TMilestoneReward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type MilestoneRewardDocument = mongoose.Document & TMilestoneReward;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: Number,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });
export const MilestoneReward = mongoose.model<MilestoneRewardDocument>('MilestoneRewards', schema);
