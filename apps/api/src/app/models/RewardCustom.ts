import mongoose from 'mongoose';
import { questSchema } from './Quest';
import { RewardVariant } from '@thxnetwork/common/enums';

export type RewardCustomDocument = mongoose.Document & TRewardCustom;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        variant: { type: Number, default: RewardVariant.Custom },
        metadata: String,
        webhookId: String,
    },
    { timestamps: true },
);

export const RewardCustom = mongoose.model<RewardCustomDocument>('customrewards', schema);
