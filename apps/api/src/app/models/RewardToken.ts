import mongoose from 'mongoose';
import { RewardBase } from '../types/RewardBase';
import { TRewardToken } from '../types/RewardToken';

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
    return await RewardBase.findById(this.rewardBaseId);
});
export const RewardToken = mongoose.model<RewardTokenDocument>('RewardToken', rewardTokenSchema);
