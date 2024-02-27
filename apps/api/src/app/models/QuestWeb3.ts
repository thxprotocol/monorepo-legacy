import mongoose from 'mongoose';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type QuestWeb3Document = mongoose.Document & TQuestWeb3;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        amount: Number,
        chainId: Number,
        contracts: Array({
            chainId: Number,
            address: String,
        }),
        methodName: String,
        threshold: Number,
    },
    { timestamps: true },
);

export const QuestWeb3 = mongoose.model<QuestWeb3Document>('QuestWeb3s', schema, 'web3quests');
