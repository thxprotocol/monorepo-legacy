import { TBaseQuest } from './BaseReward';
import { RewardConditionInteraction, RewardConditionPlatform, TPointRewardClaim } from '@thxnetwork/types/';

export type TPointReward = TBaseQuest & {
    amount: number;
    platform: RewardConditionPlatform;
    interaction: RewardConditionInteraction;
    content: string;
    contentMetadata: any;
    entries?: TPointRewardClaim[];
};
