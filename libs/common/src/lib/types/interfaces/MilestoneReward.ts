import { TBaseQuest } from './BaseReward';

export type TMilestoneReward = TBaseQuest & {
    amount: number;
    limit: number;
    eventName: string;
};
