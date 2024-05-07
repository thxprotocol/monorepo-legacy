type TQuestGitcoin = TBaseQuest & {
    amount: number;
    scorerId: number;
    score: number;
};

type TQuestGitcoinEntry = {
    poolId: string;
    questId: string;
    sub: string;
    amount: number;
    createdAt: Date;
    metadata: TQuestGitcoinEntryMetadata;
};

type TQuestGitcoinEntryMetadata = {
    address: string;
    score: number;
};
