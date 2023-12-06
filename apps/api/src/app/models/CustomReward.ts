import mongoose from 'mongoose';
import { perkBaseSchema } from './ERC20Perk';
import { TCustomReward } from '@thxnetwork/types/interfaces';

export type CustomRewardDocument = mongoose.Document & TCustomReward;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        metadata: String,
        webhookId: String,
    },
    { timestamps: true },
);

export const CustomReward = mongoose.model<CustomRewardDocument>('customrewards', schema);
