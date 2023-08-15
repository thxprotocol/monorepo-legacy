import { WebhookStatus, WebhookRequestState } from '../enums/Webhook';
import { HighlightResult } from 'highlight.js';

export type TWebhook = {
    _id?: string;
    sub: string;
    url: string;
    poolId: string;
    status: WebhookStatus;
    webhookRequests: TWebhookRequest[];
    createdAt?: Date;
};

export type TWebhookRequest = {
    _id?: string;
    webhookId: string;
    payload: string;
    payloadFormatted?: HighlightResult;
    attempts: number;
    state: WebhookRequestState;
    failReason: string;
    createdAt?: Date;
};
