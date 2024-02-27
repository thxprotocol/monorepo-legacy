import mongoose from 'mongoose';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type QuestInviteDocument = mongoose.Document & TQuestInvite;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        amount: Number,
        pathname: String,
        successUrl: String,
        token: String,
        isMandatoryReview: Boolean,
    },
    { timestamps: true },
);

export const QuestInvite = mongoose.model<QuestInviteDocument>('QuestInvites', schema);
