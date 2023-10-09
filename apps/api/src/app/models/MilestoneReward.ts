import mongoose from 'mongoose';
import { TMilestoneReward } from '@thxnetwork/types/';
import { questBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type MilestoneRewardDocument = mongoose.Document & TMilestoneReward;

const schema = new mongoose.Schema(
    {
        ...questBaseSchema,
        amount: Number,
        limit: Number,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });
export const MilestoneReward = mongoose.model<MilestoneRewardDocument>('MilestoneRewards', schema);
