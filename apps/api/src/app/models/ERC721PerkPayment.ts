import mongoose from 'mongoose';
import { TERC721PerkPayment } from '@thxnetwork/types/';

export type ERC721PerkPaymentDocument = mongoose.Document & TERC721PerkPayment;

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

export const ERC721PerkPayment = mongoose.model<ERC721PerkPaymentDocument>('ERC721PerkPayments', schema);
