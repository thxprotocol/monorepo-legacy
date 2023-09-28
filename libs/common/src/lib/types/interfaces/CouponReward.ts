import { TBasePerk } from './BaseReward';

export type TCouponReward = TBasePerk & {
    couponsFile: string;
};

export type TCouponRewardPayment = {
    perkId: string;
    sub: string;
    walletId: string;
    poolId: string;
    amount: number;
};
