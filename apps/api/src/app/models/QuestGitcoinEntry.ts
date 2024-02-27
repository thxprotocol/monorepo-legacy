import mongoose from 'mongoose';

export type QuestGitcoinEntryDocument = mongoose.Document & TGitcoinQuestEntry;

const schema = new mongoose.Schema(
    {
        poolId: String,
        questId: String,
        sub: { type: String, index: 'hashed' },
        address: String,
        amount: Number,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const QuestGitcoinEntry = mongoose.model<QuestGitcoinEntryDocument>('GitcoinQuestEntries', schema);
