import { TBaseQuest } from './BaseReward';

export type TGitcoinQuest = TBaseQuest & {
    amount: number;
    scorerId: number;
    score: number;
};

export type TGitcoinQuestEntry = {
    poolId: string;
    questId: string;
    sub: string;
    amount: number;
    address: string;
    createdAt: Date;
};
