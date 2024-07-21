type TEvent = {
    _id: string;
    identity: TIdentity;
    identityId: string;
    poolId: string;
    name: string;
    createdAt: Date;
    account?: TAccount;
};

type TEventState = TPaginationParams & { results: TEvent[]; metadata: { eventTypes: string[[]] } };
