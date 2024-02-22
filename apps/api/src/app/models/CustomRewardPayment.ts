import mongoose from 'mongoose';
import { TCustomRewardPayment } from '@thxnetwork/types/interfaces';

export type CustomRewardPaymentDocument = mongoose.Document & TCustomRewardPayment;

const schema = new mongoose.Schema(
    {
        perkId: String,
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
schema.index({ createdAt: 1 });

export const CustomRewardPayment = mongoose.model<CustomRewardPaymentDocument>(
    'CustomRewardPayments',
    schema,
    'customrewardpayments',
);
