import mongoose from 'mongoose';
import { TWebhookRequest } from '@thxnetwork/types/interfaces';

export type WebhookDocument = mongoose.Document & TWebhookRequest;

const webhookSchema = new mongoose.Schema(
    {
        webhookId: String,
        payload: String,
        attempts: Number,
        status: Number,
        failReason: String,
    },
    { timestamps: true },
);

export const Webhook = mongoose.model<WebhookDocument>('Webhook', webhookSchema, 'wehbooks');
