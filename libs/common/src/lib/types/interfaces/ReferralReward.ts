import { TBaseReward } from './BaseReward';

export type TReferralReward = TBaseReward & {
    successUrl: string;
    pathname: string;
    token: string;
    amount: number;
    isMandatoryReview: boolean;
};
