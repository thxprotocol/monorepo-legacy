import { TBaseReward } from './BaseReward';

export type TERC20Reward = TBaseReward & {
    amount: string;
    progress?: number;
    page?: number;
};
