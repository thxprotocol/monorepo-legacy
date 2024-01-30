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
    TGitcoinQuest,
    TGitcoinQuestEntry,
} from '..';
export type TQuest = TDailyReward | TReferralReward | TPointReward | TMilestoneReward | TWeb3Quest | TGitcoinQuest;
export type TQuestEntry =
    | TDailyRewardClaim
    | TReferralRewardClaim
    | TPointRewardClaim
    | TMilestoneRewardClaim
    | TWeb3QuestClaim
    | TGitcoinQuestEntry;

export type TValidationResult = {
    result: boolean;
    reason?: string;
};
