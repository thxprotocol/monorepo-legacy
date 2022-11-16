import mongoose from 'mongoose';

export type TPointReward = {
    poolId: string;
    amount: string;
    title: string;
    description: string;
};

export type PointRewardDocument = mongoose.Document & TPointReward;

const pointRewardSchema = new mongoose.Schema(
    {
        poolId: String,
        amount: String,
        title: String,
        description: String,
    },
    { timestamps: true },
);

export const PointReward = mongoose.model<PointRewardDocument>('PointReward', pointRewardSchema, 'pointrewards');
