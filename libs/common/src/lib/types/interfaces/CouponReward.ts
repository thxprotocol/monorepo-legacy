import { TBasePerk } from './BaseReward';

export type TCouponReward = TBasePerk & {
    couponCodes: string[];
    webshopUrl: string;
};

export type TCouponRewardPayment = {
    rewardId: string;
    coupontCodeId: string;
    walletId: string;
    sub: string;
    poolId: string;
    amount: number;
};

export type TCouponCode = {
    couponRewardId: string;
    poolId: string;
    code: string;
};
