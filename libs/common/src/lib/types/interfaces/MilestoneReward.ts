import { TBaseReward } from './BaseReward';

export type TMilestoneReward = TBaseReward & {
    amount: number;
    limit: number;
    eventName: string;
};
