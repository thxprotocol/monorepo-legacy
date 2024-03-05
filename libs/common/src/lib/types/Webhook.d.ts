type TWebhook = {
    _id?: string;
    sub: string;
    url: string;
    poolId: string;
    status: WebhookStatus;
    active: boolean;
    webhookRequests: TWebhookRequest[];
    createdAt?: Date;
};

type TWebhookRequest = {
    _id?: string;
    webhookId: string;
    payload: string;
    payloadFormatted?: HighlightResult;
    attempts: number;
    httpStatus: number;
    state: WebhookRequestState;
    failReason: string;
    createdAt?: Date;
};
