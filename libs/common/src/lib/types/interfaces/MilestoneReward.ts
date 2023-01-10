import { TBaseReward } from './BaseReward';

export type MilestoneReward = TBaseReward & {
    amount: number;
};
