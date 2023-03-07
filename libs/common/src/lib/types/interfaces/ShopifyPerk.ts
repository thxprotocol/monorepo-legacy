import { TBaseReward } from './BaseReward';

export type TShopifyPerk = TBaseReward & {
    poolId: string;
    amount: string;
    pointPrice: number;
    isPromoted: boolean;
};
