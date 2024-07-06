import { QuestVariant, QuestSocialRequirement } from '../enums';

export const questInteractionVariantMap = {
    [QuestSocialRequirement.YouTubeLike]: QuestVariant.YouTube,
    [QuestSocialRequirement.YouTubeSubscribe]: QuestVariant.YouTube,
    [QuestSocialRequirement.TwitterReply]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterFollow]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterQuery]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterRetweet]: QuestVariant.Twitter,
    [QuestSocialRequirement.DiscordGuildJoined]: QuestVariant.Discord,
    [QuestSocialRequirement.DiscordGuildRole]: QuestVariant.Discord,
    [QuestSocialRequirement.DiscordMessage]: QuestVariant.Discord,
    [QuestSocialRequirement.DiscordMessageReaction]: QuestVariant.Discord,
};
