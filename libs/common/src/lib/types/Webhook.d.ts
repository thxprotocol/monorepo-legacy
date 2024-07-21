type TWebhook = {
    _id?: string;
    sub: string;
    url: string;
    poolId: string;
    status: WebhookStatus;
    active: boolean;
    webhookRequests: TWebhookRequest[];
    createdAt?: Date;
    signingSecret: string;
};

type TWebhookRequest = {
    _id?: string;
    webhookId: string;
    response: string;
    responseFormatted?: HighlightResult;
    payload: string;
    payloadFormatted?: HighlightResult;
    attempts: number;
    httpStatus: number;
    state: WebhookRequestState;
    failReason: string;
    createdAt?: Date;
};

type TWebhookState = {
    [id: string]: TWebhook;
};
