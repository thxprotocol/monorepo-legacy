import mongoose from 'mongoose';
import { TERC20Reward, TERC721Reward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '../util/rewards';

export type ERC20RewardDocument = mongoose.Document & TERC721Reward;

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
