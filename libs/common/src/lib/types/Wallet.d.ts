type TWallet = {
    _id: string;
    poolId: string;
    sub: string;
    chainId: ChainId;
    address: string;
    version: string;
    variant: WalletVariant;
    safeVersion: string;
    transactions: TTransaction[];
    uuid: string;
    createdAt: Date;
    expiresAt: Date;
};
