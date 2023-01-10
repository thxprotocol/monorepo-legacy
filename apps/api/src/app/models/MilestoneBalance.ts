import mongoose from 'mongoose';

export type TMilestoneBalance = {
    poolId: string;
    balance: string;
    sub: string;
};

export type MilestoneBalanceDocument = mongoose.Document & TMilestoneBalance;

const milestoneBalanceSchema = new mongoose.Schema(
    {
        poolId: String,
        balance: String,
        sub: String,
    },
    { timestamps: true },
);

export const MilestoneBalance = mongoose.model<MilestoneBalanceDocument>('MilestoneBalance', milestoneBalanceSchema, 'milestonebalances');
