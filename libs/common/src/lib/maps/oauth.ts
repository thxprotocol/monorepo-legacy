import { AccountVariant, AccessTokenKind, QuestSocialRequirement } from '../enums';

export const providerIconMap = {
    [AccessTokenKind.Google]: 'fab fa-youtube',
    [AccessTokenKind.Twitter]: 'fab fa-twitter',
    [AccessTokenKind.Discord]: 'fab fa-discord',
    [AccessTokenKind.Twitch]: 'fab fa-twitch',
    [AccessTokenKind.Github]: 'fab fa-github',
};

export const accountVariantProviderMap = {
    [AccountVariant.SSOGoogle]: AccessTokenKind.Google,
    [AccountVariant.SSODiscord]: AccessTokenKind.Discord,
    [AccountVariant.SSOTwitter]: AccessTokenKind.Twitter,
    [AccountVariant.SSOGithub]: AccessTokenKind.Github,
    [AccountVariant.SSOTwitch]: AccessTokenKind.Twitch,
};

export const providerAccountVariantMap = {
    [AccessTokenKind.Google]: AccountVariant.SSOGoogle,
    [AccessTokenKind.Discord]: AccountVariant.SSODiscord,
    [AccessTokenKind.Twitter]: AccountVariant.SSOTwitter,
    [AccessTokenKind.Github]: AccountVariant.SSOGithub,
    [AccessTokenKind.Twitch]: AccountVariant.SSOTwitch,
};

export const interactionComponentMap = {
    [QuestSocialRequirement.YouTubeSubscribe]: 'BaseDropdownYoutubeChannels',
    [QuestSocialRequirement.YouTubeLike]: 'BaseDropdownYoutubeVideo',
    [QuestSocialRequirement.TwitterLike]: 'BaseDropdownTwitterTweets',
    [QuestSocialRequirement.TwitterRetweet]: 'BaseDropdownTwitterTweets',
    [QuestSocialRequirement.TwitterLikeRetweet]: 'BaseDropdownTwitterTweets',
    [QuestSocialRequirement.TwitterFollow]: 'BaseDropdownTwitterUsers',
    [QuestSocialRequirement.TwitterQuery]: 'BaseDropdownTwitterQuery',
    [QuestSocialRequirement.DiscordGuildJoined]: 'BaseDropdownDiscordGuilds',
    [QuestSocialRequirement.DiscordGuildRole]: 'BaseDropdownDiscordRoles',
    [QuestSocialRequirement.DiscordMessage]: 'BaseDropdownDiscordMessage',
    [QuestSocialRequirement.DiscordMessageReaction]: 'BaseDropdownDiscordMessageReaction',
};
