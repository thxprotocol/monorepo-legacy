import { TBaseQuest } from './BaseReward';

export type TReferralReward = TBaseQuest & {
    successUrl: string;
    pathname: string;
    token: string;
    amount: number;
    isMandatoryReview: boolean;
};
