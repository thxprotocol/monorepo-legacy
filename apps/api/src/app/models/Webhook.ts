import mongoose from 'mongoose';

export type WebhookDocument = mongoose.Document & TWebhook;

export const Webhook = mongoose.model<WebhookDocument>(
    'Webhook',
    new mongoose.Schema(
        {
            sub: String,
            poolId: String,
            url: String,
            active: { default: false, type: Boolean },
        },
        { timestamps: true },
    ),
    'webhook',
);
