import mongoose from 'mongoose';
import { TERC20PerkPayment } from '@thxnetwork/types/index';

export type ERC20PerkPaymentDocument = mongoose.Document & TERC20PerkPayment;

const schema = new mongoose.Schema(
    {
        perkId: String,
        sub: String,
        poolId: String,
        amount: Number,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ERC20PerkPayment = mongoose.model<ERC20PerkPaymentDocument>('erc20perkpayments', schema);
