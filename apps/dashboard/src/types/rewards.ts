import { TClaim } from '@thxnetwork/dashboard/store/modules/claims';
import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/index';

export enum RewardState {
    Disabled = 0,
    Enabled = 1,
}

interface Poll {
    id: number;
    startTime: number;
    endTime: number;
    totalVoted: number;
    withdrawAmount: number;
    withdrawDuration: number;
    withdrawUnlockDate: Date;
    yesCounter: number;
    noCounter: number;
}

export interface Reward {
    _id: string;
    id: string;
    expiryDate: Date;
    withdrawLimit: number;
    withdrawAmount: number;
    withdrawDuration: number;
    withdrawUnlockDate: Date;
    state: RewardState;
    poolId: string;
    poll: Poll;
    withdrawCondition: IRewardCondition;
    progress: number;
    isClaimOnce: boolean;
    isMembershipRequired: boolean;
    title: string;
    claims: TClaim[];
    amount: number;
    createdAt: Date;
    updatedAt: Date;
    erc721metadataId: string;
}

export interface IRewards {
    [poolId: string]: { [id: string]: Reward };
}

export enum ChannelType {
    None = 0,
    YouTube = 1,
    Twitter = 2,
}

export enum ChannelAction {
    None = -1,
    YouTubeLike = 0,
    YouTubeSubscribe = 1,
    TwitterLike = 2,
    TwitterRetweet = 3,
    TwitterFollow = 4,
}

export const channelList: IChannel[] = [
    {
        type: RewardConditionPlatform.None,
        name: RewardConditionPlatform[0],
        logoURI: '',
        actions: [],
    },
    {
        type: RewardConditionPlatform.Google,
        name: RewardConditionPlatform[1],
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-youtube.png'),
        actions: [RewardConditionInteraction.YouTubeLike, RewardConditionInteraction.YouTubeSubscribe],
    },
    {
        type: RewardConditionPlatform.Twitter,
        name: RewardConditionPlatform[2],
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-twitter.png'),
        actions: [
            RewardConditionInteraction.TwitterLike,
            RewardConditionInteraction.TwitterRetweet,
            RewardConditionInteraction.TwitterFollow,
        ],
    },
];
export const channelActionList = [
    {
        type: RewardConditionInteraction.None,
        name: 'None',
        items: [],
    },
    {
        type: RewardConditionInteraction.YouTubeLike,
        name: 'Like',
        items: [],
    },
    {
        type: RewardConditionInteraction.YouTubeSubscribe,
        name: 'Subscribe',
        items: [],
    },
    {
        type: RewardConditionInteraction.TwitterLike,
        name: 'Like',
        items: [],
    },
    {
        type: RewardConditionInteraction.TwitterRetweet,
        name: 'Retweet',
        items: [],
    },
    {
        type: RewardConditionInteraction.TwitterFollow,
        name: 'Follow',
        items: [],
    },
];

export interface IRewardCondition {
    channelType: RewardConditionPlatform;
    channelAction: RewardConditionInteraction;
    channelItem: any;
}

export interface IChannel {
    type: RewardConditionPlatform;
    name: string;
    logoURI: string;
    actions: RewardConditionInteraction[];
}

export interface IChannelAction {
    type: RewardConditionInteraction;
    name: string;
    items: any[];
}
