import {
    TWeb3Quest,
    TDailyReward,
    TReferralReward,
    TPointReward,
    TMilestoneReward,
    TDailyRewardClaim,
    TReferralRewardClaim,
    TPointRewardClaim,
    TMilestoneRewardClaim,
    TWeb3QuestClaim,
} from '..';
export type TQuest = TDailyReward | TReferralReward | TPointReward | TMilestoneReward | TWeb3Quest;
export type TQuestEntry =
    | TDailyRewardClaim
    | TReferralRewardClaim
    | TPointRewardClaim
    | TMilestoneRewardClaim
    | TWeb3QuestClaim;
