import mongoose from 'mongoose';

export type QuestWeb3EntryDocument = mongoose.Document & TQuestWeb3Entry;

const schema = new mongoose.Schema(
    {
        poolId: String,
        questId: String,
        sub: { type: String, index: 'hashed' },
        amount: Number,
        chainId: Number,
        address: String,
    },
    { timestamps: true },
);

export const QuestWeb3Entry = mongoose.model<QuestWeb3EntryDocument>('QuestWeb3Entrys', schema, 'web3questclaims');
