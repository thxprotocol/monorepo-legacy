import mongoose from 'mongoose';

import { TRewardReferral } from '../types/RewardReferral';
import { IRewardBaseUpdates, RewardBase } from './RewardBase';

export type RewardReferralDocument = mongoose.Document & TRewardReferral;

export interface IRewardReferralUpdates extends IRewardBaseUpdates {
    amount?: number;
}

const rewardReferralSchema = new mongoose.Schema(
    {
        id: String,
        rewardBaseId: String,
        amount: Number,
    },
    { timestamps: true },
);
rewardReferralSchema.virtual('rewardBase').get(async function () {
    return await RewardBase.findOne({ id: this.rewardBaseId });
});

export const RewardReferral = mongoose.model<RewardReferralDocument>('RewardReferral', rewardReferralSchema);
