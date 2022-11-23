import { TRewardBase } from './RewardBase';

export type TRewardReferral = {
    id: string;
    rewardBaseId: string;
    amount: number;
    rewardBase: TRewardBase;
};
