import mongoose from 'mongoose';
import { RewardVariant } from './enums/RewardVariant';

export type TRewardBase = {
    id: string;
    title: string;
    slug: string;
    variant: RewardVariant;
    poolId: string;
    limit: number;
    expiryDate: Date;
    state: number;
};

export type RewardBaseDocument = mongoose.Document & TRewardBase;

export const RewardBaseSchema = new mongoose.Schema(
    {
        id: String,
        title: String,
        slug: String,
        variant: Number,
        poolId: String,
        limit: Number,
        expiryDate: Date,
        state: Number,
    },
    { timestamps: true },
);

export const RewardBase = mongoose.model<RewardBaseDocument>('RewardBase', RewardBaseSchema);
