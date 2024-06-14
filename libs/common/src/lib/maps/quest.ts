import { QuestVariant, QuestSocialRequirement } from '../enums';

export const questInteractionVariantMap = {
    [QuestSocialRequirement.TwitterFollow]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterQuery]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterRetweet]: QuestVariant.Twitter,
    [QuestSocialRequirement.YouTubeLike]: QuestVariant.YouTube,
    [QuestSocialRequirement.YouTubeSubscribe]: QuestVariant.YouTube,
    [QuestSocialRequirement.DiscordGuildJoined]: QuestVariant.Discord,
    [QuestSocialRequirement.DiscordGuildRole]: QuestVariant.Discord,
    [QuestSocialRequirement.DiscordMessage]: QuestVariant.Discord,
    [QuestSocialRequirement.DiscordMessageReaction]: QuestVariant.Discord,
};
