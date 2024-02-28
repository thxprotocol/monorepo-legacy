import mongoose from 'mongoose';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type QuestCustomDocument = mongoose.Document & TQuestCustom;

export const QuestCustom = mongoose.model<QuestCustomDocument>(
    'QuestCustom',
    new mongoose.Schema(
        {
            ...(questSchema as any),
            amount: Number,
            limit: Number,
            eventName: String,
        },
        { timestamps: true },
    ),
    'questcustom',
);
