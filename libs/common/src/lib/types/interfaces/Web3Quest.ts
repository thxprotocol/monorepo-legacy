import { ChainId } from '../enums';
import { TBaseQuest } from './BaseReward';

export type TWeb3Quest = TBaseQuest & {
    amount: number;
    methodName: string;
    threshold: number;
    contracts: { chainId: ChainId; address: string }[];
};

export type TWeb3QuestClaim = {
    questId: string;
    sub: string;
    amount: number;
    poolId: string;
    chainId: ChainId;
    address: string;
    createdAt: Date;
};
