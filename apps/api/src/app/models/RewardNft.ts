import mongoose from 'mongoose';
import { RewardBase } from '../types/RewardBase';
import { TRewardNft } from '../types/RewardNft';

export type RewardNftDocument = mongoose.Document & TRewardNft;

const rewardNftSchema = new mongoose.Schema(
    {
        id: String,
        rewardBaseId: String,
        erc721metadataId: String,
        rewardConditionId: String,
    },
    { timestamps: true },
);
rewardNftSchema.virtual('rewardBase').get(async function () {
    return await RewardBase.findById(this.rewardBaseId);
});

export const RewardNft = mongoose.model<RewardNftDocument>('RewardNft', rewardNftSchema);
