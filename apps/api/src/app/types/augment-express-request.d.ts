namespace Express {
    interface Request {
        origin?: string;
        auth?: any;
        rawBody?: string;
        account?: TAccount;
        wallet?: WalletDocument;
        campaign?: PoolDocument;
        quest?: TQuest;
    }
}
