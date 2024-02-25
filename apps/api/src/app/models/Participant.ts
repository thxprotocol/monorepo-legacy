import mongoose from 'mongoose';
import { TParticipant } from '@thxnetwork/types/index';

export type ParticipantDocument = mongoose.Document & TParticipant;

const participantSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        rank: Number,
        score: Number,
        balance: { type: Number, default: 0 },
        questEntryCount: Number,
        isSubscribed: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export const Participant = mongoose.model<ParticipantDocument>('Participant', participantSchema, 'participants');
