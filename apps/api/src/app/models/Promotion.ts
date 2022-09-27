import mongoose from 'mongoose';
import { TPromotion } from '@thxnetwork/api/types/TPromotion';

export type PromotionDocument = mongoose.Document & TPromotion;

const PromotionSchema = new mongoose.Schema(
    {
        sub: String,
        title: String,
        description: String,
        value: String,
        price: Number,
        poolAddress: String,
        poolId: String,
    },
    { timestamps: true },
);

export const Promotion = mongoose.model<PromotionDocument>('Promotion', PromotionSchema, 'promocodes');
