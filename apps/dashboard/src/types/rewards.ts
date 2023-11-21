import { AccessTokenKind, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { AccountVariant } from '@thxnetwork/types/interfaces';

export function getInteractionComponent(interactionType: RewardConditionInteraction) {
    switch (interactionType) {
        case RewardConditionInteraction.YouTubeSubscribe:
            return 'BaseDropdownYoutubeChannels';
        case RewardConditionInteraction.YouTubeLike:
            return 'BaseDropdownYoutubeVideo';
        case RewardConditionInteraction.TwitterLike:
        case RewardConditionInteraction.TwitterRetweet:
        case RewardConditionInteraction.TwitterLikeRetweet:
            return 'BaseDropdownTwitterTweets';
        case RewardConditionInteraction.TwitterFollow:
            return 'BaseDropdownTwitterUsers';
        case RewardConditionInteraction.TwitterMessage:
            return 'BaseDropdownTwitterMessage';
        case RewardConditionInteraction.DiscordGuildJoined:
            return 'BaseDropdownDiscordGuilds';
        case RewardConditionInteraction.DiscordMessage:
            return 'BaseDropdownDiscordMessage';
        case RewardConditionInteraction.DiscordMessageReaction:
            return 'BaseDropdownDiscordMessageReaction';
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

export function getUserUrl(a) {
    if (!a || a.kind !== AccessTokenKind.Twitter || !a.metadata) return;
    return `https://www.twitter.com/${a.metadata.username}`;
}

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
            RewardConditionInteraction.TwitterFollow,
            RewardConditionInteraction.TwitterLikeRetweet,
            RewardConditionInteraction.TwitterLike,
            RewardConditionInteraction.TwitterRetweet,
            RewardConditionInteraction.TwitterMessage,
        ],
    },
    {
        type: RewardConditionPlatform.Discord,
        name: 'Discord',
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-discord.png'),
        actions: [
            RewardConditionInteraction.DiscordGuildJoined,
            RewardConditionInteraction.DiscordMessage,
            RewardConditionInteraction.DiscordMessageReaction,
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
        type: RewardConditionInteraction.TwitterLikeRetweet,
        name: 'Like & Repost',
        items: [],
    },
    {
        type: RewardConditionInteraction.TwitterLike,
        name: 'Like',
        items: [],
    },
    {
        type: RewardConditionInteraction.TwitterRetweet,
        name: 'Repost',
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
    {
        type: RewardConditionInteraction.DiscordMessage,
        name: 'Message',
        items: [],
    },
    // {
    //     type: RewardConditionInteraction.DiscordMessageReaction,
    //     name: 'Message Reaction',
    //     items: [],
    // },
];

export const platformIconMap: any = {
    [RewardConditionPlatform.None]: '',
    [RewardConditionPlatform.Google]: 'fab fa-youtube',
    [RewardConditionPlatform.Twitter]: 'fab fa-twitter',
    [RewardConditionPlatform.Discord]: 'fab fa-discord',
    [RewardConditionPlatform.Twitch]: 'fab fa-twitch',
    [RewardConditionPlatform.Github]: 'fab fa-github',
};

export const platformAccessKeyMap: any = {
    [RewardConditionPlatform.None]: '',
    [RewardConditionPlatform.Google]: 'youtubeManageAccess',
    [RewardConditionPlatform.Twitter]: 'twitterAccess',
    [RewardConditionPlatform.Discord]: 'discordAccess',
    [RewardConditionPlatform.Github]: 'githubAccess',
    [RewardConditionPlatform.Twitch]: 'twitchAccess',
};

export const accountVariantPlatformMap: any = {
    [AccountVariant.SSOTwitter]: RewardConditionPlatform.Twitter,
    [AccountVariant.SSODiscord]: RewardConditionPlatform.Discord,
    [AccountVariant.SSOGoogle]: RewardConditionPlatform.Google,
    [AccountVariant.SSOTwitch]: RewardConditionPlatform.Twitch,
    [AccountVariant.SSOGithub]: RewardConditionPlatform.Github,
};

export const tokenKindPlatformMap: any = {
    [AccessTokenKind.Twitter]: RewardConditionPlatform.Twitter,
    [AccessTokenKind.Discord]: RewardConditionPlatform.Discord,
    [AccessTokenKind.YoutubeManage]: RewardConditionPlatform.Google,
    [AccessTokenKind.Twitch]: RewardConditionPlatform.Twitch,
    [AccessTokenKind.Github]: RewardConditionPlatform.Github,
};

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
