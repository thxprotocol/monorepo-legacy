import mongoose from 'mongoose';

export type QuestDailyEntryDocument = mongoose.Document & TQuestDailyEntry;

export const QuestDailyEntry = mongoose.model<QuestDailyEntryDocument>(
    'QuestDailyEntry',
    new mongoose.Schema(
        {
            questId: String,
            sub: String,
            uuid: String,
            amount: Number,
            poolId: String,
            metadata: {
                state: Number,
                ip: String,
            },
        },
        { timestamps: true },
    ),
    'questdailyentry',
);
