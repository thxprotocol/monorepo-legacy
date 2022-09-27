import mongoose from 'mongoose';

export type IMember = mongoose.Document & {
    sub?: string;
    address: string;
    poolId: string;
};

const memberSchema = new mongoose.Schema(
    {
        sub: String,
        address: String,
        poolId: String,
    },
    { timestamps: true },
);

export const Member = mongoose.model<IMember>('Member', memberSchema, 'member');
