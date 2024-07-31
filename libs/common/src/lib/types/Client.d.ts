type TClient = {
    _id: string;
    sub: string;
    name: string;
    secret: string;
    createdAt: Date;
};

type TClientState = {
    [clientId: string]: TClient;
};
