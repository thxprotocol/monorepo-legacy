import { TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import mongoose from 'mongoose';
import { questBaseSchema } from './ERC20Perk';

export type PointRewardDocument = mongoose.Document & TPointReward;

const schema = new mongoose.Schema(
    {
        ...questBaseSchema,
        amount: Number,
        platform: Number,
        kind: String,
        interaction: Number,
        content: String,
        contentMetadata: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const PointReward = mongoose.model<PointRewardDocument>('PointReward', schema, 'pointrewards');
