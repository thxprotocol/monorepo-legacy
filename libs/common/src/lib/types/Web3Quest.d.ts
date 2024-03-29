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
    createdAt: Date;
    metadata: TQuestWeb3EntryMetadata;
};

type TQuestWeb3EntryMetadata = {
    callResult: string;
    chainId: ChainId;
    address: string;
    rpc?: string;
};
