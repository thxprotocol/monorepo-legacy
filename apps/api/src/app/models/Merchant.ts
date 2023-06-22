import mongoose from 'mongoose';
import { TMerchant } from '@thxnetwork/types/interfaces';

export type MerchantDocument = mongoose.Document & TMerchant;

const schema = new mongoose.Schema(
    {
        sub: String,
        stripeConnectId: String,
    },
    { timestamps: true },
);

export const Merchant = mongoose.model<MerchantDocument>('merchant', schema, 'merchants');
