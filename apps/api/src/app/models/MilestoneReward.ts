import mongoose from 'mongoose';
import { MilestoneReward as TMilestoneReward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type MilestoneRewardDocument = mongoose.Document & TMilestoneReward;

const MilestoneRewardSchema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: Number,
    },
    { timestamps: true },
);

export const MilestoneReward = mongoose.model<MilestoneRewardDocument>('MilestoneRewards', MilestoneRewardSchema);
