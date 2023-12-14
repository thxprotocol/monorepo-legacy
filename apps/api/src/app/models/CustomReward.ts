import mongoose from 'mongoose';
import { perkBaseSchema } from './ERC20Perk';
import { RewardVariant } from '@thxnetwork/types/enums';
import { TCustomReward } from '@thxnetwork/types/interfaces';

export type CustomRewardDocument = mongoose.Document & TCustomReward;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        variant: { type: Number, default: RewardVariant.Custom },
        metadata: String,
        webhookId: String,
    },
    { timestamps: true },
);

export const CustomReward = mongoose.model<CustomRewardDocument>('customrewards', schema);
