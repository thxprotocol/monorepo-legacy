import mongoose from 'mongoose';
import { rewardPaymentSchema } from './Reward';

export type RewardCouponPaymentDocument = mongoose.Document & TRewardCouponPayment;

export const RewardCouponPayment = mongoose.model<RewardCouponPaymentDocument>(
    'RewardCouponPayment',
    new mongoose.Schema(
        {
            ...rewardPaymentSchema,
            couponCodeId: String,
        },
        { timestamps: true },
    ),
    'rewardcouponpayment',
);
