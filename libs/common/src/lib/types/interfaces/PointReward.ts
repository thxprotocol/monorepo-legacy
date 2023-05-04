import { TBaseReward } from './BaseReward';
import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/';

export type TPointReward = TBaseReward & {
    amount: number;
    platform: RewardConditionPlatform;
    interaction: RewardConditionInteraction;
    content: string;
    contentMetadata: any;
};
