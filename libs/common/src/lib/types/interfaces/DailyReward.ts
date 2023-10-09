import { TBaseReward } from './BaseReward';

export type TDailyReward = TBaseReward & {
    amounts: number[];
    progress?: number;
    claims?: any[];
    isEnabledWebhookQualification: boolean;
};
