import mongoose from 'mongoose';
import { TWebhookRequest } from '@thxnetwork/types/interfaces';

export type WebhookRequestDocument = mongoose.Document & TWebhookRequest;

const webhookRequestSchema = new mongoose.Schema(
    {
        webhookId: String,
        payload: String,
        attempts: Number,
        state: Number,
        failReason: String,
    },
    { timestamps: true },
);

export const WebhookRequest = mongoose.model<WebhookRequestDocument>(
    'WebhookRequest',
    webhookRequestSchema,
    'webhookrequests',
);
