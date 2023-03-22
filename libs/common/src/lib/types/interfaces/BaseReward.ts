import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/';

export type TBaseReward = {
    _id?: string;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    expiryDate: Date;
    claimAmount: number;
    claimLimit: number;
    limit: number;
    platform: RewardConditionPlatform;
    interaction?: RewardConditionInteraction;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
    progress?: number;
    page?: number;
    claims?: any[];
};
