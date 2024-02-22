import mongoose from 'mongoose';
import { TGitcoinQuestEntry } from '@thxnetwork/types/interfaces';

export type GitcoinQuestEntryDocument = mongoose.Document & TGitcoinQuestEntry;

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

export const GitcoinQuestEntry = mongoose.model<GitcoinQuestEntryDocument>('GitcoinQuestEntries', schema);
