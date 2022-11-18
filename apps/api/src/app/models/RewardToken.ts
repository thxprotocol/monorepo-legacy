import mongoose from 'mongoose';

import { TRewardToken } from '../types/RewardToken';
import { RewardBase } from './RewardBase';

export type RewardTokenDocument = mongoose.Document & TRewardToken;

const rewardTokenSchema = new mongoose.Schema(
    {
        id: String,
        rewardBaseId: String,
        amount: Number,
        rewardConditionId: String,
    },
    { timestamps: true },
);
rewardTokenSchema.virtual('rewardBase').get(async function () {
    return await RewardBase.findOne({ id: this.rewardBaseId });
});
export const RewardToken = mongoose.model<RewardTokenDocument>('RewardToken', rewardTokenSchema);
