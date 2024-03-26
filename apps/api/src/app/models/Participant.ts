import mongoose from 'mongoose';

export type ParticipantDocument = mongoose.Document & TParticipant;

export const Participant = mongoose.model<ParticipantDocument>(
    'Participant',
    new mongoose.Schema(
        {
            sub: String,
            poolId: String,
            rank: Number,
            score: Number,
            balance: { type: Number, default: 0 },
            questEntryCount: Number,
            riskAnalysis: { score: Number, reasons: [String] },
            isSubscribed: { type: Boolean, default: false },
        },
        { timestamps: true },
    ),
    'participant',
);
