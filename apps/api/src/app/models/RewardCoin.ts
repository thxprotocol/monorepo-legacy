import mongoose from 'mongoose';
import { RewardVariant } from '@thxnetwork/common/enums';
import { rewardSchema } from './Reward';

export type RewardCoinDocument = mongoose.Document & TRewardCoin;

export const RewardCoin = mongoose.model<RewardCoinDocument>(
    'RewardCoin',
    new mongoose.Schema(
        {
            ...rewardSchema,
            variant: { type: Number, default: RewardVariant.Coin },
            erc20Id: String,
            amount: String,
        },
        { timestamps: true },
    ),
    'rewardcoin',
);
