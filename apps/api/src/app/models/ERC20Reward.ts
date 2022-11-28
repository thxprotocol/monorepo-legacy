import mongoose from 'mongoose';
import { TERC20Reward } from '@thxnetwork/types/';

export const rewardBaseSchema = {
    uuid: String,
    poolId: String,
    title: String,
    description: String,
    expiryDate: Date,
    claimAmount: Number,
    rewardLimit: Number,
    platform: Number,
    interaction: Number,
    content: String,
};

export type ERC20RewardDocument = mongoose.Document & TERC20Reward;

const erc20RewardSchema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: String,
    },
    { timestamps: true },
);

export const ERC20Reward = mongoose.model<ERC20RewardDocument>('erc20rewards', erc20RewardSchema);
