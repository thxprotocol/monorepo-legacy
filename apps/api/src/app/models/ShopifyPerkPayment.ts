import mongoose from 'mongoose';
import { TShopifyPerkPayment } from '@thxnetwork/types/index';

export type ShopifyPerkPaymentDocument = mongoose.Document & TShopifyPerkPayment;

const schema = new mongoose.Schema(
    {
        perkId: String,
        sub: { type: String, index: 'hashed' },
        poolId: String,
        amount: Number,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ShopifyPerkPayment = mongoose.model<ShopifyPerkPaymentDocument>('shopifyperkpayments', schema);
