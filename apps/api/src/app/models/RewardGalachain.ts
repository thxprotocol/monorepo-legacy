import mongoose from 'mongoose';
import { rewardSchema } from './Reward';
import { RewardVariant } from '@thxnetwork/common/enums';

export type RewardGalachainDocument = mongoose.Document & TRewardGalachain;

export const RewardGalachain = mongoose.model<RewardGalachainDocument>(
    'RewardGalachain',
    new mongoose.Schema(
        {
            ...rewardSchema,
            variant: { type: Number, default: RewardVariant.Galachain },
            amount: String,
            contractChannelName: { type: String, required: true },
            contractChaincodeName: { type: String, required: true },
            contractContractName: { type: String, required: true },
            tokenCollection: { type: String, required: true },
            tokenCategory: { type: String, required: true },
            tokenType: { type: String, required: true },
            tokenAdditionalKey: { type: String, required: true },
            tokenInstance: { type: Number, required: true },
        },
        { timestamps: true },
    ),
    'rewardgalachain',
);
