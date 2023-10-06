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

export type TQuestEmbed = {
    title: string;
    description: string;
    author: {
        name: string;
        icon_url: string;
        url: string;
    };
    thumbnail: {
        url: string;
    };
    footer: {
        text: string;
        icon_url: string;
    };
    color: number;
    fields: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
};
