import { TBaseReward } from './BaseReward';

export type TShopifyPerk = TBaseReward & {
    poolId: string;
    amount: string;
    pointPrice: number;
    isPromoted: boolean;
    priceRuleId: string;
    discountCode: string;
    image: string;
    price: number;
    priceCurrency: string;
};
