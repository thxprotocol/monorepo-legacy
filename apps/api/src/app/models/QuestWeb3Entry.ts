import mongoose from 'mongoose';

export type QuestWeb3EntryDocument = mongoose.Document & TQuestWeb3Entry;

export const QuestWeb3Entry = mongoose.model<QuestWeb3EntryDocument>(
    'QuestWeb3Entry',
    new mongoose.Schema(
        {
            poolId: String,
            questId: String,
            sub: String,
            amount: Number,
            metadata: {
                chainId: Number,
                callResult: String,
                address: String,
            },
        },
        { timestamps: true },
    ),
    'questweb3entry',
);
