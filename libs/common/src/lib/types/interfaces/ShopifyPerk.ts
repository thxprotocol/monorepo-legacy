import { TBasePerk } from './BaseReward';
import { TShopifyPerkPayment } from './ShopifyPerkPayment';

export type TShopifyPerk = TBasePerk & {
    amount: number;
    priceRuleId: string;
    discountCode: string;
    claims?: TShopifyPerkPayment[];
};
