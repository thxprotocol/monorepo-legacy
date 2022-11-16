import mongoose from 'mongoose';
import { RewardNft, RewardNftDocument } from '../models/RewardNft';
import { RewardReferral, RewardReferralDocument } from '../models/RewardReferral';
import { RewardToken, RewardTokenDocument } from '../models/RewardToken';
import { RewardState } from './enums/RewardState';
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
    amount: number;
};

export interface IRewardBaseUpdates {
    state: RewardState;
}

interface IRewardBaseMethods {
    getReward(): RewardNftDocument | RewardReferralDocument | RewardTokenDocument;
}

export type RewardBaseDocument = mongoose.Document & TRewardBase & IRewardBaseMethods;

const rewardBaseSchema = new mongoose.Schema(
    {
        id: String,
        title: String,
        slug: String,
        variant: Number,
        poolId: String,
        limit: Number,
        expiryDate: Date,
        state: Number,
        amount: Number,
    },
    { timestamps: true },
);

rewardBaseSchema.method('getReward', async function getReward() {
    switch (this.variant) {
        case RewardVariant.RewardNFT:
            return RewardNft.findOne({ rewardBaseId: this.id });

        case RewardVariant.RewardReferral:
            return RewardReferral.findOne({ rewardBaseId: this.id });

        case RewardVariant.RewardToken:
            return RewardToken.findOne({ rewardBaseId: this.id });
    }
});

rewardBaseSchema.pre('remove', function (next) {
    RewardNft.remove({ rewardBaseId: this.id }).exec();
    RewardReferral.remove({ rewardBaseId: this.id }).exec();
    RewardToken.remove({ rewardBaseId: this.id }).exec();
    next();
});

export const RewardBase = mongoose.model<RewardBaseDocument>('RewardBase', rewardBaseSchema);
