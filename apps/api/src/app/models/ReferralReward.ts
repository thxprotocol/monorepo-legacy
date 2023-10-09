import mongoose from 'mongoose';
import { TReferralReward } from '@thxnetwork/types/';
import { questBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type ReferralRewardDocument = mongoose.Document & TReferralReward;

const schema = new mongoose.Schema(
    {
        ...questBaseSchema,
        amount: Number,
        pathname: String,
        successUrl: String,
        token: String,
        isMandatoryReview: Boolean,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ReferralReward = mongoose.model<ReferralRewardDocument>('ReferralRewards', schema);
