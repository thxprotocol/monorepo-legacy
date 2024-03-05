import mongoose from 'mongoose';
import { rewardSchema } from './Reward';
import { RewardVariant } from '@thxnetwork/common/enums';

export type RewardCouponDocument = mongoose.Document & TRewardCoupon;

export const RewardCoupon = mongoose.model<RewardCouponDocument>(
    'RewardCoupon',
    new mongoose.Schema(
        {
            ...rewardSchema,
            variant: { type: Number, default: RewardVariant.Coupon },
            webshopURL: String,
        },
        { timestamps: true },
    ),
    'rewardcoupon',
);
