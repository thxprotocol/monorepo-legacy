import { TBaseReward } from './BaseReward';

export type TDailyReward = TBaseReward & {
    amount: number;
    progress?: number;
    claims?: any[];
    isEnabledWebhookQualification: boolean;
};
