import mongoose from 'mongoose';

export type RewardCustomPaymentDocument = mongoose.Document & TRewardCustomPayment;

const schema = new mongoose.Schema(
    {
        rewardId: String,
        sub: { type: String, index: 'hashed' },
        poolId: String,
        amount: Number,
        paymentIntent: {
            id: String,
            amount: Number,
            currency: String,
        },
    },
    { timestamps: true },
);

export const RewardCustomPayment = mongoose.model<RewardCustomPaymentDocument>(
    'RewardCustomPayments',
    schema,
    'customrewardpayments',
);
