import mongoose from 'mongoose';
import { RewardBaseSchema, TRewardBase } from './RewardBase';

export type RewardToken = TRewardBase & {
    rewardBaseId: string;
    amount: number;
    rewardConditionId: string;
};

export type RewardTokenDocument = mongoose.Document & RewardToken;

const rewardTokenSchema = new mongoose.Schema(
    {
        ...RewardBaseSchema.obj,
        rewardBaseId: String,
        amount: Number,
        rewardConditionId: String,
    },
    { timestamps: true },
);

export const RewardToken = mongoose.model<RewardTokenDocument>('RewardToken', rewardTokenSchema);
