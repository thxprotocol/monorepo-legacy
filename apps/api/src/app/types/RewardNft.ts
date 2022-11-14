import mongoose from 'mongoose';
import { RewardBaseSchema, TRewardBase } from './RewardBase';

export type RewardNft = TRewardBase & {
    rewardBaseId: string;
    erc721metadataId?: string;
    rewardConditionId: string;
};

export type RewardNftDocument = mongoose.Document & RewardNft;

const rewardNftSchema = new mongoose.Schema(
    {
        ...RewardBaseSchema.obj,
        rewardBaseId: String,
        erc721metadataId: String,
        rewardConditionId: String,
    },
    { timestamps: true },
);

export const RewardNft = mongoose.model<RewardNftDocument>('RewardNft', rewardNftSchema);
