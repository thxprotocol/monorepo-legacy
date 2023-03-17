import mongoose from 'mongoose';
import { TShopifyDiscountCode } from '@thxnetwork/types/';

export type ShopifyDiscountCodeDocument = mongoose.Document & TShopifyDiscountCode;

const schema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        shopifyPerkId: String,
        discountCodeId: String,
        priceRuleId: String,
        code: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ShopifyDiscountCode = mongoose.model<ShopifyDiscountCodeDocument>('shopifydiscountcodes', schema);
