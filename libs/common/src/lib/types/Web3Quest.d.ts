type TQuestWeb3 = TBaseQuest & {
    amount: number;
    methodName: string;
    threshold: string;
    contracts: { chainId: ChainId; address: string }[];
};

type TQuestWeb3Entry = {
    questId: string;
    sub: string;
    amount: number;
    poolId: string;
    chainId: ChainId;
    address: string;
    createdAt: Date;
};
