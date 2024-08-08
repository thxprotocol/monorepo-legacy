type TQuestGitcoin = TBaseQuest & {
    amount: number;
    scorerId: number;
    score: number;
};

type TQuestGitcoinEntry = TBaseQuestEntry & {
    metadata: TQuestGitcoinEntryMetadata;
};

type TQuestGitcoinEntryMetadata = {
    address: string;
    score: number;
};
