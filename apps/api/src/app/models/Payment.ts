import mongoose from 'mongoose';
import { PaymentState } from '@thxnetwork/api/types/enums/PaymentState';
import PaymentService from '@thxnetwork/api/services/PaymentService';

export type TPayment = {
    amount: string;
    token: string;
    tokenAddress: string;
    poolId: string;
    chainId: number;
    sender: string;
    receiver: string;
    transactions: string[];
    state: PaymentState;
    paymentUrl: string;
    successUrl: string;
    cancelUrl: string;
    failUrl: string;
    createdAt: Date;
    updatedAt?: Date;
    metadataId?: string;
};

export type PaymentDocument = mongoose.Document & TPayment;

const paymentSchema = new mongoose.Schema(
    {
        amount: String,
        token: String,
        tokenAddress: String,
        chainId: Number,
        poolId: String,
        sender: String,
        receiver: String,
        transactions: [String],
        item: String,
        state: Number,
        successUrl: String,
        cancelUrl: String,
        failUrl: String,
        metadataId: String,
    },
    { timestamps: true },
);

paymentSchema.virtual('paymentUrl').get(function () {
    return PaymentService.getPaymentUrl(this._id.toString(), this.token);
});

export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema, 'payments');
