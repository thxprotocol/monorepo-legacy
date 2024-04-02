import mongoose from 'mongoose';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type QuestWeb3Document = mongoose.Document & TQuestWeb3;

export const QuestWeb3 = mongoose.model<QuestWeb3Document>(
    'QuestWeb3',
    new mongoose.Schema(
        {
            ...(questSchema as any),
            amount: Number,
            contracts: Array({
                chainId: Number,
                address: String,
            }),
            methodName: String,
            threshold: String,
        },
        { timestamps: true },
    ),
    'questweb3',
);
