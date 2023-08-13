import { WebhookStatus, WebhookRequestState } from '../enums/Webhook';

export type TWebhook = {
    _id?: string;
    url: string;
    poolId: string;
    status: WebhookStatus;
    requestCreated?: number;
    createdAt?: Date;
};

export type TWebhookRequest = {
    _id?: string;
    webhookId: string;
    payload: string;
    attempts: number;
    state: WebhookRequestState;
    failReason: string;
    createdAt?: Date;
};
