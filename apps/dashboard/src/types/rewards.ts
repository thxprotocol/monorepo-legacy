import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types';

export const platformList: IChannel[] = [
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
export const platformInteractionList = [
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
    platform: RewardConditionPlatform;
    interaction: RewardConditionInteraction;
    content: string;
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
