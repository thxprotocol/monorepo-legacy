import mongoose from 'mongoose';
import { rewardPaymentSchema } from './Reward';

export type RewardCouponPaymentDocument = mongoose.Document & TRewardCouponPayment;

const schema = new mongoose.Schema(
    {
        ...rewardPaymentSchema,
        couponCodeId: String,
    },
    { timestamps: true },
);

export const RewardCouponPayment = mongoose.model<RewardCouponPaymentDocument>('couponrewardpayments', schema);
