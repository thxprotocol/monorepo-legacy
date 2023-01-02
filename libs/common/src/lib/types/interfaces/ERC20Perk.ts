import { TBaseReward } from './BaseReward';

export type TERC20Perk = TBaseReward & {
    amount: string;
    pointPrice: number;
    image?: string;
    isPromoted: boolean;
};
