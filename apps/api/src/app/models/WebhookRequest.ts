import mongoose from 'mongoose';

export type WebhookRequestDocument = mongoose.Document & TWebhookRequest;

export const WebhookRequest = mongoose.model<WebhookRequestDocument>(
    'WebhookRequest',
    new mongoose.Schema(
        {
            webhookId: String,
            payload: String,
            attempts: { type: Number, default: 0 },
            state: Number,
            httpStatus: Number,
            failReason: String,
        },
        { timestamps: true },
    ),
    'webhookrequest',
);
