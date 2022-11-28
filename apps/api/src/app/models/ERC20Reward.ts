import mongoose from 'mongoose';
import { TERC20Reward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/util/rewards';

export type ERC20RewardDocument = mongoose.Document & TERC20Reward;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: String,
    },
    { timestamps: true },
);

schema.virtual('isConditional', (r: TERC20Reward) => {
    return r.platform && r.interaction && r.content;
});

export const ERC20Reward = mongoose.model<ERC20RewardDocument>('erc20rewards', schema);
