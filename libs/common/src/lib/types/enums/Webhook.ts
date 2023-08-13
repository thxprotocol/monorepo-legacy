export enum WebhookVariant {
    Inbound = 0,
    Outbound = 1,
}

export enum WebhookStatus {
    Inactive = 0,
    Active = 1,
}

export enum WebhookRequestState {
    Pending = 0,
    Sent = 1,
    Received = 2,
    Failed = 3,
}
