import { TDailyReward } from '@thxnetwork/types/interfaces/DailyReward';
import mongoose from 'mongoose';
import { questBaseSchema } from './ERC20Perk';

export type DailyRewardDocument = mongoose.Document & TDailyReward;

const schema = new mongoose.Schema(
    {
        ...questBaseSchema,
        amounts: [Number],
        eventName: String,
        isEnabledWebhookQualification: Boolean,
    },
    { timestamps: true },
);

export const DailyReward = mongoose.model<DailyRewardDocument>('DailyReward', schema, 'dailyrewards');
