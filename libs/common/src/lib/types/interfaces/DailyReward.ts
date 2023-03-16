import { TBaseReward } from './BaseReward';

export type TDailyReward = TBaseReward & {
    amount: number;
};
