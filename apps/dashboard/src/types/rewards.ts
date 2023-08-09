import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';

export function getInteractionComponent(interactionType: RewardConditionInteraction) {
    switch (interactionType) {
        case RewardConditionInteraction.YouTubeSubscribe:
            return 'BaseDropdownYoutubeChannels';
        case RewardConditionInteraction.YouTubeLike:
            return 'BaseDropdownYoutubeVideo';
        case RewardConditionInteraction.TwitterLike:
        case RewardConditionInteraction.TwitterRetweet:
            return 'BaseDropdownTwitterTweets';
        case RewardConditionInteraction.TwitterFollow:
            return 'BaseDropdownTwitterUsers';
        case RewardConditionInteraction.TwitterMessage:
            return 'BaseDropdownTwitterMessage';
        case RewardConditionInteraction.DiscordGuildJoined:
            return 'BaseDropdownDiscordGuilds';
        default:
            return '';
    }
}

export const getInteraction = (interactionType: RewardConditionInteraction): IChannelAction => {
    return platformInteractionList.find((a) => a.type === interactionType) as IChannelAction;
};

export const getPlatform = (platformType: RewardConditionPlatform) => {
    return platformList.find((c) => c.type === platformType) as IChannel;
};

export const platformList: IChannel[] = [
    {
        type: RewardConditionPlatform.None,
        name: 'None',
        logoURI: '',
        actions: [],
    },
    {
        type: RewardConditionPlatform.Google,
        name: 'YouTube',
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-youtube.png'),
        actions: [RewardConditionInteraction.YouTubeLike, RewardConditionInteraction.YouTubeSubscribe],
    },
    {
        type: RewardConditionPlatform.Twitter,
        name: 'Twitter',
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-twitter.png'),
        actions: [
            RewardConditionInteraction.TwitterLike,
            RewardConditionInteraction.TwitterRetweet,
            RewardConditionInteraction.TwitterFollow,
            RewardConditionInteraction.TwitterMessage,
        ],
    },
    {
        type: RewardConditionPlatform.Discord,
        name: 'Discord',
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-discord.png'),
        actions: [RewardConditionInteraction.DiscordGuildJoined],
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
        type: RewardConditionInteraction.TwitterMessage,
        name: 'Message',
        items: [],
    },
    {
        type: RewardConditionInteraction.TwitterFollow,
        name: 'Follow',
        items: [],
    },
    {
        type: RewardConditionInteraction.DiscordGuildJoined,
        name: 'Server Joined',
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
    items: unknown[];
}
