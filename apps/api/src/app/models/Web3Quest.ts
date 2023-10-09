import mongoose from 'mongoose';
import { TWeb3Quest } from '@thxnetwork/types/interfaces';
import { questBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type Web3QuestDocument = mongoose.Document & TWeb3Quest;

const schema = new mongoose.Schema(
    {
        ...questBaseSchema,
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
schema.index({ createdAt: 1 });

export const Web3Quest = mongoose.model<Web3QuestDocument>('Web3Quests', schema, 'web3quests');
