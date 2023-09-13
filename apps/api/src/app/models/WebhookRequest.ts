import mongoose from 'mongoose';
import { TWebhookRequest } from '@thxnetwork/types/interfaces';

export type WebhookRequestDocument = mongoose.Document & TWebhookRequest;

const webhookRequestSchema = new mongoose.Schema(
    {
        webhookId: String,
        payload: String,
        attempts: { type: Number, default: 0 },
        state: Number,
        httpStatus: Number,
        failReason: String,
    },
    { timestamps: true },
);

export const WebhookRequest = mongoose.model<WebhookRequestDocument>(
    'WebhookRequest',
    webhookRequestSchema,
    'webhookrequests',
);
