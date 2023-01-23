import mongoose from 'mongoose';
import { TERC20PerkPayment } from '@thxnetwork/types/index';

export type ERC20PerkPaymentDocument = mongoose.Document & TERC20PerkPayment;

const erc20PerkPaymentSchema = new mongoose.Schema(
    {
        perkId: String,
        sub: String,
        poolId: String,
    },
    { timestamps: true },
);

export const ERC20PerkPayment = mongoose.model<ERC20PerkPaymentDocument>('erc20perkpayments', erc20PerkPaymentSchema);
