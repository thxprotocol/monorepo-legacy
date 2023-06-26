export type TClient = {
    _id: string;
    page: number;
    name: string;
    sub: string;
    poolId: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    createdAt: Date;
    redirectUri?: string;
    requestUri?: string;
};

export type TClientState = {
    [poolId: string]: {
        [page: number]: TClient[];
    };
};
