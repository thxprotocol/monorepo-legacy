import mongoose from 'mongoose';

export type TPointBalance = {
    poolId: string;
    balance: string;
    sub: string;
};

export type PointBalanceDocument = mongoose.Document & TPointBalance;

const pointBalanceSchema = new mongoose.Schema(
    {
        poolId: String,
        balance: String,
        sub: String,
    },
    { timestamps: true },
);

export const PointBalance = mongoose.model<PointBalanceDocument>('PointBalance', pointBalanceSchema, 'pointbalances');
