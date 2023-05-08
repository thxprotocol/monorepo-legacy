import mongoose from 'mongoose';
import { perkBaseSchema } from './ERC20Perk';
import { TShopifyPerk } from '@thxnetwork/types/';

export type ShopifyPerkDocument = mongoose.Document & TShopifyPerk;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        amount: Number,
        priceRuleId: String,
        discountCode: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ShopifyPerk = mongoose.model<ShopifyPerkDocument>('shopifyperks', schema);
