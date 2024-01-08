import mongoose from 'mongoose';
import { RewardVariant } from '@thxnetwork/types/enums';
import { TERC20Perk } from '@thxnetwork/types/interfaces';

export const questBaseSchema = {
    uuid: String,
    poolId: { type: String, index: 'hashed' },
    variant: Number,
    title: String,
    description: String,
    image: String,
    index: Number,
    expiryDate: Date,
    infoLinks: [{ label: String, url: String }],
    isPublished: { type: Boolean, default: false },
};

export const perkBaseSchema = {
    uuid: String,
    poolId: { type: String, index: 'hashed' },
    title: String,
    description: String,
    image: String,
    pointPrice: Number,
    expiryDate: Date,
    limit: Number,
    isPromoted: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    // Token Gating
    tokenGatingVariant: Number,
    tokenGatingContractAddress: String,
    tokenGatingAmount: Number,
    // QR Codes
    claimAmount: Number,
    claimLimit: Number,
};

export type ERC20PerkDocument = mongoose.Document & TERC20Perk;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        variant: { type: Number, default: RewardVariant.Coin },
        limit: Number,
        erc20Id: String,
        amount: String,
        pointPrice: Number,
        image: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ERC20Perk = mongoose.model<ERC20PerkDocument>('erc20perks', schema);
