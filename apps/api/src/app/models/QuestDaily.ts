import mongoose from 'mongoose';
import { questSchema } from './Quest';

export type QuestDailyDocument = mongoose.Document & TQuestDaily;

export const QuestDaily = mongoose.model<QuestDailyDocument>(
    'QuestDaily',
    new mongoose.Schema(
        {
            ...(questSchema as any),
            amounts: [Number],
            eventName: String,
        },
        { timestamps: true },
    ),
    'questdaily',
);
