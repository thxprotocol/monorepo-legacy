type TClient = {
    _id: string;
    page: number;
    name: string;
    sub: string;
    poolId: string;
    grantType: GrantVariant;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    requestUri: string;
    createdAt?: Date;
};

type TClientState = {
    [poolId: string]: { [clientId: string]: TClient };
};
