import mongoose from 'mongoose';

export type QuestWeb3EntryDocument = mongoose.Document & TQuestWeb3Entry;

export const QuestWeb3Entry = mongoose.model<QuestWeb3EntryDocument>(
    'QuestWeb3Entry',
    new mongoose.Schema(
        {
            poolId: String,
            questId: String,
            sub: { type: String, index: 'hashed' },
            amount: Number,
            chainId: Number,
            address: String,
        },
        { timestamps: true },
    ),
    'questweb3entry',
);
