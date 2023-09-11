import mongoose from 'mongoose';

export type TParticipant = mongoose.Document & {
    sub?: string;
    poolId: string;
};

const participantSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
    },
    { timestamps: true },
);

export const Participant = mongoose.model<TParticipant>('Participant', participantSchema, 'participants');
