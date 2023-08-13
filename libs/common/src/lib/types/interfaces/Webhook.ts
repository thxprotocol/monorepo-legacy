import { WebhookStatus, WebhookRequestStatus } from '../enums/Webhook';

export type TWebhook = {
    _id?: string;
    url: string;
    poolId: string;
    status: WebhookStatus;
    createdAt?: Date;
};
export type TWebhookRequest = {
    _id?: string;
    webhookId: string;
    payload: string;
    attempts: number;
    status: WebhookRequestStatus;
    failReason: string;
    createdAt?: Date;
};
