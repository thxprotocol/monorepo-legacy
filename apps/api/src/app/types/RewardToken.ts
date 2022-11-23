import { TRewardBase } from './RewardBase';

export type TRewardToken = {
    id: string;
    rewardBaseId: string;
    withdrawAmount: number;
    rewardConditionId?: string;
    rewardBase: TRewardBase;
};
