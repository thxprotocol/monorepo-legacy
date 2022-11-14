import mongoose from 'mongoose';
import { RewardBaseSchema, TRewardBase } from './RewardBase';

export type RewardReferral = TRewardBase & {
    rewardBaseId: string;
    amount: number;
};

export type RewardReferralDocument = mongoose.Document & RewardReferral;

const rewardReferralSchema = new mongoose.Schema(
    {
        ...RewardBaseSchema.obj,
        rewardBaseId: String,
        amount: Number,
    },
    { timestamps: true },
);

export const RewardReferral = mongoose.model<RewardReferralDocument>('RewardReferral', rewardReferralSchema);
