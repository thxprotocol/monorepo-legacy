import { AccessTokenKind, OAuthRequiredScopes, OAuthScope, QuestSocialRequirement } from '@thxnetwork/common/enums';

export const getInteraction = (type: QuestSocialRequirement) => {
    return providerInteractionList.find((a) => a.type === type);
};

export const getPlatform = (kind: AccessTokenKind) => {
    return providerList.find((c) => c.kind === kind);
};

export function getUserUrl(a) {
    if (!a || a.kind !== AccessTokenKind.Twitter || !a.metadata) return;
    return `https://www.twitter.com/${a.metadata.username}`;
}

export type TQuestSocialProvider = {
    kind: AccessTokenKind;
    scopes: OAuthScope[];
    name: string;
    logoURI: string;
    actions: QuestSocialRequirement[];
};

export type TQuestSocialInteraction = {
    type: QuestSocialRequirement;
    name: string;
    items: [];
};

export const providerList: TQuestSocialProvider[] = [
    {
        kind: AccessTokenKind.Google,
        scopes: OAuthRequiredScopes.GoogleAuth,
        name: 'YouTube',
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-youtube.png'),
        actions: [QuestSocialRequirement.YouTubeLike, QuestSocialRequirement.YouTubeSubscribe],
    },
    {
        kind: AccessTokenKind.Twitter,
        scopes: OAuthRequiredScopes.TwitterAuth,
        name: 'Twitter',
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-twitter.png'),
        actions: [
            QuestSocialRequirement.TwitterFollow,
            QuestSocialRequirement.TwitterReply,
            QuestSocialRequirement.TwitterRetweet,
            QuestSocialRequirement.TwitterQuery,
        ],
    },
    {
        kind: AccessTokenKind.Discord,
        scopes: OAuthRequiredScopes.DiscordAuth,
        name: 'Discord',
        logoURI: require('@thxnetwork/dashboard/../public/assets/logo-discord.png'),
        actions: [
            QuestSocialRequirement.DiscordGuildJoined,
            QuestSocialRequirement.DiscordGuildRole,
            QuestSocialRequirement.DiscordMessage,
            QuestSocialRequirement.DiscordMessageReaction,
        ],
    },
];
export const providerInteractionList: TQuestSocialInteraction[] = [
    {
        type: QuestSocialRequirement.YouTubeLike,
        name: 'Like',
        items: [],
    },
    {
        type: QuestSocialRequirement.YouTubeSubscribe,
        name: 'Subscribe',
        items: [],
    },
    {
        type: QuestSocialRequirement.TwitterReply,
        name: 'Reply',
        items: [],
    },
    {
        type: QuestSocialRequirement.TwitterRetweet,
        name: 'Repost',
        items: [],
    },
    {
        type: QuestSocialRequirement.TwitterQuery,
        name: 'Query',
        items: [],
    },
    {
        type: QuestSocialRequirement.TwitterFollow,
        name: 'Follow',
        items: [],
    },
    {
        type: QuestSocialRequirement.DiscordGuildJoined,
        name: 'Server Joined',
        items: [],
    },
    {
        type: QuestSocialRequirement.DiscordMessage,
        name: 'Message',
        items: [],
    },
    {
        type: QuestSocialRequirement.DiscordGuildRole,
        name: 'Role',
        items: [],
    },
    // {
    //     type: QuestSocialRequirement.DiscordMessageReaction,
    //     name: 'Message Reaction',
    //     items: [],
    // },
];
// export interface IChannel {
//     kind: AccessTokenKind;
//     name: string;
//     logoURI: string;
//     actions: QuestSocialRequirement[];
// }
