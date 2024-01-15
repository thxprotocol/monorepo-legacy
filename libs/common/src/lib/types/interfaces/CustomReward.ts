import { TBaseReward } from './BaseReward';

export type TCustomReward = TBaseReward & {
    webhookId: string;
    metadata: string;
};

export type TCustomRewardPayment = {
    perkId: string;
    sub: string;
    walletId: string;
    poolId: string;
    amount: number;
};
