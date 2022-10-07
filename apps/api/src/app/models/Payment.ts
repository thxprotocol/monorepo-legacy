import mongoose from 'mongoose';
import { PaymentState } from '@thxnetwork/api/types/enums/PaymentState';
import PaymentService from '@thxnetwork/api/services/PaymentService';

export type TPayment = {
    id: string;
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
    promotionId?: string;
};

export type PaymentDocument = mongoose.Document & TPayment;

const paymentSchema = new mongoose.Schema(
    {
        id: String,
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
        promotionId: String,
    },
    { timestamps: true },
);

paymentSchema.virtual('paymentUrl').get(function () {
    return PaymentService.getPaymentUrl(this.id, this.token);
});

export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema, 'payments');
