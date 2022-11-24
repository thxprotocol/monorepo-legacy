import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/';

export type TBaseReward = {
    _id?: string;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    expiryDate: Date;
    claimAmount: string;
    rewardLimit: number;
    isClaimOnce: boolean;
    isConditional?: boolean;
    platform?: RewardConditionPlatform;
    interaction?: RewardConditionInteraction;
    content?: string;
};
