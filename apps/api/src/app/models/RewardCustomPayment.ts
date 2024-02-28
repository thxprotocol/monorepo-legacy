import mongoose from 'mongoose';
import { rewardPaymentSchema } from './Reward';

export type RewardCustomPaymentDocument = mongoose.Document & TRewardCustomPayment;

export const RewardCustomPayment = mongoose.model<RewardCustomPaymentDocument>(
    'RewardCustomPayment',
    new mongoose.Schema(
        {
            ...rewardPaymentSchema,
        },
        { timestamps: true },
    ),
    'rewardcustompayment',
);
