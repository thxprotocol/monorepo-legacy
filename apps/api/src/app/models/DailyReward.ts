import { TDailyReward } from '@thxnetwork/types/interfaces/DailyReward';
import mongoose from 'mongoose';
import { rewardBaseSchema } from './ERC20Perk';

export type DailyRewardDocument = mongoose.Document & TDailyReward;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: Number,
        isEnabledWebhookQualification: Boolean,
    },
    { timestamps: true },
);

export const DailyReward = mongoose.model<DailyRewardDocument>('DailyReward', schema, 'dailyrewards');
