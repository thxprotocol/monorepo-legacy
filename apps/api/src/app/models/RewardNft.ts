import mongoose from 'mongoose';

import { TRewardNft } from '../types/RewardNft';
import { IRewardBaseUpdates, RewardBase } from './RewardBase';

export type RewardNftDocument = mongoose.Document & TRewardNft;

export interface IRewardNftUpdates extends IRewardBaseUpdates {
    erc721metadataId?: string;
    rewardConditionId?: string;
}

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
    return await RewardBase.findOne({ id: this.rewardBaseId });
});

export const RewardNft = mongoose.model<RewardNftDocument>('RewardNft', rewardNftSchema);
