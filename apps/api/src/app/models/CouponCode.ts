import mongoose from 'mongoose';

export type CouponCodeDocument = mongoose.Document & TCouponCode;

export const CouponCode = mongoose.model<CouponCodeDocument>(
    'CouponCode',
    new mongoose.Schema(
        {
            poolId: String,
            couponRewardId: String,
            code: String,
            sub: String,
        },
        { timestamps: true },
    ),
    'couponcode',
);
