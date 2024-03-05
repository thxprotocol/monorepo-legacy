type TGitcoinQuest = TBaseQuest & {
    amount: number;
    scorerId: number;
    score: number;
};

type TGitcoinQuestEntry = {
    poolId: string;
    questId: string;
    sub: string;
    amount: number;
    address: string;
    createdAt: Date;
};
