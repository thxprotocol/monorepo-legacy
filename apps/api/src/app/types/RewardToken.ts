import { TRewardBase } from './RewardBase';

export type TRewardToken = {
    id: string;
    rewardBaseId: string;
    amount: number;
    rewardConditionId?: string;
    rewardBase: TRewardBase;
};
