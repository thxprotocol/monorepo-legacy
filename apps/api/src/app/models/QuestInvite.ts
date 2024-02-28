import mongoose from 'mongoose';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type QuestInviteDocument = mongoose.Document & TQuestInvite;

export const QuestInvite = mongoose.model<QuestInviteDocument>(
    'QuestInvite',
    new mongoose.Schema(
        {
            ...(questSchema as any),
            amount: Number,
            pathname: String,
            successUrl: String,
            token: String,
            isMandatoryReview: Boolean,
        },
        { timestamps: true },
    ),
    'questinvite',
);
