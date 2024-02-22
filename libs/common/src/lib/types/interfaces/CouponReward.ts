import { TBaseReward } from './BaseReward';

export type TCouponReward = TBaseReward & {
    codes: string[];
    couponCodes: TCouponCode[];
    webshopURL: string;
};

export type TCouponRewardPayment = {
    perkId: string;
    couponCodeId: string;
    sub: string;
    poolId: string;
    amount: number;
};

export type TCouponCode = {
    _id: string;
    couponRewardId: string;
    poolId: string;
    code: string;
    sub: string;
    createdAt: Date;
};
