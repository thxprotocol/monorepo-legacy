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
            contract: {
                channelName: { type: String, required: true },
                chaincodeName: { type: String, required: true },
                contractName: { type: String, required: true },
            },
            token: {
                collection: { type: String, required: true },
                category: { type: String, required: true },
                type: { type: String, required: true },
                additionalKey: { type: String, required: true },
                instance: { type: String, required: true },
            },
        },
        { timestamps: true },
    ),
    'rewardgalachain',
);
