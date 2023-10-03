import mongoose from 'mongoose';
import { TCouponCode } from '@thxnetwork/types/interfaces';

export type CouponCodeDocument = mongoose.Document & TCouponCode;

const schema = new mongoose.Schema(
    {
        poolId: String,
        couponRewardId: String,
        code: String,
        sub: String,
    },
    { timestamps: true },
);

export const CouponCode = mongoose.model<CouponCodeDocument>('couponcodes', schema);
