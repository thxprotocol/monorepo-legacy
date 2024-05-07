import mongoose from 'mongoose';
import { questSchema } from './Quest';

export type QuestWebhookDocument = mongoose.Document & TQuestWebhook;

export const QuestWebhook = mongoose.model<QuestWebhookDocument>(
    'QuestWebhook',
    new mongoose.Schema(
        {
            ...(questSchema as any),
            amount: Number,
            webhookId: String,
            metadata: String,
        },
        { timestamps: true },
    ),
    'questwebhook',
);
