import { TBaseQuest } from './BaseReward';
import { AccessTokenKind, QuestSocialRequirement, TPointRewardClaim } from '@thxnetwork/types/';

export type TPointReward = TBaseQuest & {
    amount: number;
    platform: number; // Deprecate in favor of kind
    kind: AccessTokenKind;
    interaction: QuestSocialRequirement;
    content: string;
    contentMetadata: any;
    entries?: TPointRewardClaim[];
};
