import { TBaseReward } from './BaseReward';

export type TERC20Reward = TBaseReward & {
    amount: string;
    pointPrice?: number;
    image?: string;
};
