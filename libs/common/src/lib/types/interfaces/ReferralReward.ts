import { TBaseReward } from './BaseReward';

export type TReferralReward = TBaseReward & {
    amount: string;
    successUrl: string;
};
