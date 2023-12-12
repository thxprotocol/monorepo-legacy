import mongoose from 'mongoose';

export type TParticipant = {
    sub: string;
    poolId: string;
    rank: number;
    score: number;
    questEntryCount: number;
};

export type ParticipantDocument = mongoose.Document & TParticipant;

const participantSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        rank: Number,
        score: Number,
        questEntryCount: Number,
    },
    { timestamps: true },
);

export const Participant = mongoose.model<ParticipantDocument>('Participant', participantSchema, 'participants');
