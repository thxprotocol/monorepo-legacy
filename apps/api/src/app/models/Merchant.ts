import mongoose from 'mongoose';
import { TMerchant } from '@thxnetwork/types/merchant';

export type MerchantSchema = mongoose.Document & TMerchant;

const schema = new mongoose.Schema(
    {
        sub: String,
        stripeConnectId: String,
    },
    { timestamps: true },
);

export const Merchant = mongoose.model<MerchantSchema>('merchant', schema, 'merchants');
