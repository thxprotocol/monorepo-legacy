import { TBasePerk } from './BaseReward';

export type TCouponReward = TBasePerk & {
    codes: string[];
    couponCodes: TCouponCode[];
    webshopURL: string;
};

export type TCouponRewardPayment = {
    perkId: string;
    couponCodeId: string;
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
    sub: string;
    createdAt: Date;
};
