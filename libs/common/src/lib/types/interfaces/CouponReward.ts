import { TBasePerk } from './BaseReward';

export type TCouponReward = TBasePerk & {
    codes: string[];
    couponCodes: TCouponCode[];
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
    _id: string;
    couponRewardId: string;
    poolId: string;
    code: string;
    createdAt: Date;
};
