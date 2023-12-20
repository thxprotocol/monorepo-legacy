import { TBaseReward } from './BaseReward';

export type TDailyReward = TBaseReward & {
    amounts: number[];
    progress?: number;
    claims?: any[];
    events?: any[];
    eventName?: string;
};
