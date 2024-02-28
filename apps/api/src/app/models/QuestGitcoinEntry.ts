import mongoose from 'mongoose';

export type QuestGitcoinEntryDocument = mongoose.Document & TGitcoinQuestEntry;

export const QuestGitcoinEntry = mongoose.model<QuestGitcoinEntryDocument>(
    'QuestGitcoinEntry',
    new mongoose.Schema(
        {
            poolId: String,
            questId: String,
            sub: { type: String, index: 'hashed' },
            address: String,
            amount: Number,
        },
        { timestamps: true },
    ),
    'questgitcoinentry',
);
