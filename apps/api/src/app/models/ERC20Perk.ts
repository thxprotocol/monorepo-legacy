import mongoose from 'mongoose';
import { TERC20Perk } from '@thxnetwork/types/';

export const rewardBaseSchema = {
    uuid: String,
    poolId: { type: String, index: 'hashed' },
    title: String,
    description: String,
    infoLinks: [{ label: String, url: String }],
};

export const perkBaseSchema = {
    uuid: String,
    poolId: { type: String, index: 'hashed' },
    title: String,
    description: String,
    image: String,
    pointPrice: Number,
    expiryDate: Date,
    claimAmount: Number,
    claimLimit: Number,
    limit: Number,
    isPromoted: {
        type: Boolean,
        default: false,
    },
    tokenGatingVariant: Number,
    tokenGatingContractAddress: String,
    tokenGatingAmount: Number,
};

export type ERC20PerkDocument = mongoose.Document & TERC20Perk;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        erc20Id: String,
        amount: String,
        pointPrice: Number,
        image: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ERC20Perk = mongoose.model<ERC20PerkDocument>('erc20perks', schema);
