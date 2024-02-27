import mongoose from 'mongoose';
import { questSchema } from './Quest';

export type QuestDailyDocument = mongoose.Document & TDailyReward;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        amounts: [Number],
        eventName: String,
        isEnabledWebhookQualification: Boolean,
    },
    { timestamps: true },
);

export const QuestDaily = mongoose.model<QuestDailyDocument>('DailyReward', schema, 'dailyrewards');
