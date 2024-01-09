import { TGate } from '@thxnetwork/common/lib/types/interfaces/Gate';
import mongoose from 'mongoose';

export type GateDocument = mongoose.Document & TGate;

const gateSchema = new mongoose.Schema(
    {
        poolId: String,
        title: String,
        description: String,
        variant: Number,
        amount: Number,
        score: Number,
        contractAddress: String,
    },
    { timestamps: true },
);

export const Gate = mongoose.model<GateDocument>('Gate', gateSchema, 'gates');
