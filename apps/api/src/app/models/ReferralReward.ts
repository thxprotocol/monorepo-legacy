import mongoose from 'mongoose';
import { TReferralReward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Reward';

export type ReferralRewardDocument = mongoose.Document & TReferralReward;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: Number,
    },
    { timestamps: true },
);

schema.virtual('isConditional', (r: TReferralReward) => {
    return r.platform && r.interaction && r.content;
});

export const ReferralReward = mongoose.model<ReferralRewardDocument>('ReferralRewards', schema);
