import mongoose from 'mongoose';
import { rewardBaseSchema } from './ERC20Perk';
import { TShopifyPerk } from '@thxnetwork/types/';

export type ShopifyPerkDocument = mongoose.Document & TShopifyPerk;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        poolId: String,
        amount: String,
        pointPrice: Number,
        image: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ShopifyPerk = mongoose.model<ShopifyPerkDocument>('shopifyperks', schema);
