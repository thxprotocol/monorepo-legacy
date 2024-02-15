import mongoose from 'mongoose';
import { TWeb3QuestClaim } from '@thxnetwork/types/interfaces';

export type Web3QuestClaimDocument = mongoose.Document & TWeb3QuestClaim;

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
schema.index({ createdAt: 1 });

export const Web3QuestClaim = mongoose.model<Web3QuestClaimDocument>('Web3QuestClaims', schema, 'web3questclaims');
