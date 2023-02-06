import mongoose from 'mongoose';

type TMerchant = {
    sub: string;
    stripeAccountId: string;
};

export type MerchantSchema = mongoose.Document & TMerchant;

const schema = new mongoose.Schema(
    {
        sub: String,
        stripeAccountId: String,
    },
    { timestamps: true },
);

export const Merchant = mongoose.model<MerchantSchema>('merchant', schema, 'merchants');
