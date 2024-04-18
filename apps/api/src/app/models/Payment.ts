import mongoose from 'mongoose';

export type PaymentDocument = mongoose.Document & TPayment;

export const Payment = mongoose.model<PaymentDocument>(
    'Payment',
    new mongoose.Schema(
        {
            sub: String,
            poolId: String,
        },
        { timestamps: true },
    ),
    'payment',
);
