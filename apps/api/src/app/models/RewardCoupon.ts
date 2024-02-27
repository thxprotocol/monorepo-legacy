import mongoose from 'mongoose';
import { questSchema } from './Quest';
import { RewardVariant } from '@thxnetwork/common/enums';

export type RewardCouponDocument = mongoose.Document & TRewardCoupon;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        variant: { type: Number, default: RewardVariant.Coupon },
        webshopURL: String,
    },
    { timestamps: true },
);

export const RewardCoupon = mongoose.model<RewardCouponDocument>('couponrewards', schema);
