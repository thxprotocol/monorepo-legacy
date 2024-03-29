import mongoose from 'mongoose';

export type QuestCustomEntryDocument = mongoose.Document & TQuestCustomEntry;

export const QuestCustomEntry = mongoose.model<QuestCustomEntryDocument>(
    'QuestCustomEntry',
    new mongoose.Schema(
        {
            questId: String,
            sub: String,
            uuid: String,
            amount: Number,
            isClaimed: Boolean,
            poolId: String,
        },
        { timestamps: true },
    ),
    'questcustomentry',
);
