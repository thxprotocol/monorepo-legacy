import mongoose from 'mongoose';
import { TERC20Perk } from '@thxnetwork/types/';

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
    isPromoted: {
        type: Boolean,
        default: false,
    },
};

export type ERC20PerkDocument = mongoose.Document & TERC20Perk;

const erc20PerkSchema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        erc20Id: String,
        amount: String,
        pointPrice: Number,
        image: String,
    },
    { timestamps: true },
);

export const ERC20Perk = mongoose.model<ERC20PerkDocument>('erc20perks', erc20PerkSchema);
