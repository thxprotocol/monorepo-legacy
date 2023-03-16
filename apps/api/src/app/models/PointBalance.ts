import mongoose from 'mongoose';

export type TPointBalance = {
    poolId: string;
    balance: number;
    sub: string;
};

export type PointBalanceDocument = mongoose.Document & TPointBalance;

const pointBalanceSchema = new mongoose.Schema(
    {
        poolId: String,
        balance: Number,
        sub: String,
    },
    { timestamps: true },
);

export const PointBalance = mongoose.model<PointBalanceDocument>('PointBalance', pointBalanceSchema, 'pointbalances');
