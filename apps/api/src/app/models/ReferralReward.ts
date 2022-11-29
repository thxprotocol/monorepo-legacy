import mongoose from 'mongoose';
import { TReferralReward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Reward';

export type ReferralRewardDocument = mongoose.Document & TReferralReward;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: Number,
        successUrl: String,
    },
    { timestamps: true },
);

export const ReferralReward = mongoose.model<ReferralRewardDocument>('ReferralRewards', schema);
