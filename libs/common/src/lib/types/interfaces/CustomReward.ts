import { TBasePerk } from './BaseReward';

export type TCustomReward = TBasePerk & {
    webhookId: string;
};

export type TCustomRewardPayment = {
    perkId: string;
    sub: string;
    walletId: string;
    poolId: string;
    amount: number;
};
