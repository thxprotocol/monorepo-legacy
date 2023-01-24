import mongoose from 'mongoose';
import { TERC721PerkPayment } from '@thxnetwork/types/';

export type ERC721PerkPaymentDocument = mongoose.Document & TERC721PerkPayment;

const ERC721PerkPaymentSchema = new mongoose.Schema(
    {
        perkId: String,
        sub: String,
        poolId: String,
        amount: Number,
    },
    { timestamps: true },
);

export const ERC721PerkPayment = mongoose.model<ERC721PerkPaymentDocument>(
    'ERC721PerkPayments',
    ERC721PerkPaymentSchema,
);
