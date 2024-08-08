type TQuestWeb3 = TBaseQuest & {
    amount: number;
    methodName: string;
    threshold: string;
    contracts: { chainId: ChainId; address: string }[];
};

type TQuestWeb3Entry = TBaseQuestEntry & {
    metadata: TQuestWeb3EntryMetadata;
};

type TQuestWeb3EntryMetadata = {
    callResult: string;
    chainId: ChainId;
    address: string;
    rpc?: string;
};
