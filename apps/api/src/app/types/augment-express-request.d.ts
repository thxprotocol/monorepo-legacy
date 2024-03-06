namespace Express {
    interface Request {
        origin?: string;
        auth?: any;
        rawBody?: string;
        account?: TAccount;
        campaign?: PoolDocument;
        quest?: TQuest;
    }
}
