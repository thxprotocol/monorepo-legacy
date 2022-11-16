import mongoose from 'mongoose';
import { RewardBase } from '../types/RewardBase';
import { TRewardReferral } from '../types/RewardReferral';

export type RewardReferralDocument = mongoose.Document & TRewardReferral;

const rewardReferralSchema = new mongoose.Schema(
    {
        id: String,
        rewardBaseId: String,
        amount: Number,
    },
    { timestamps: true },
);
rewardReferralSchema.virtual('rewardBase').get(async function () {
    return await RewardBase.findById(this.rewardBaseId);
});

export const RewardReferral = mongoose.model<RewardReferralDocument>('RewardReferral', rewardReferralSchema);
