import mongoose from 'mongoose';

export type QuestGitcoinEntryDocument = mongoose.Document & TQuestGitcoinEntry;

export const QuestGitcoinEntry = mongoose.model<QuestGitcoinEntryDocument>(
    'QuestGitcoinEntry',
    new mongoose.Schema(
        {
            poolId: String,
            questId: String,
            sub: String,
            amount: Number,
            metadata: {
                address: String,
                score: Number,
            },
        },
        { timestamps: true },
    ),
    'questgitcoinentry',
);
