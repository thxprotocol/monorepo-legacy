import mongoose from 'mongoose';
import { rewardSchema } from './Reward';
import { RewardVariant } from '@thxnetwork/common/enums';

export type RewardCustomDocument = mongoose.Document & TRewardCustom;

export const RewardCustom = mongoose.model<RewardCustomDocument>(
    'RewardCustom',
    new mongoose.Schema(
        {
            ...rewardSchema,
            variant: { type: Number, default: RewardVariant.Custom },
            metadata: String,
            webhookId: String,
        },
        { timestamps: true },
    ),
    'rewardcustom',
);
