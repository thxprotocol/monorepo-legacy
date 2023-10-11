import { QuestVariant, RewardConditionInteraction } from '../enums';

export const questInteractionVariantMap = {
    [RewardConditionInteraction.TwitterFollow]: QuestVariant.Twitter,
    [RewardConditionInteraction.TwitterLike]: QuestVariant.Twitter,
    [RewardConditionInteraction.TwitterMessage]: QuestVariant.Twitter,
    [RewardConditionInteraction.TwitterRetweet]: QuestVariant.Twitter,
    [RewardConditionInteraction.TwitterLikeRetweet]: QuestVariant.Twitter,
    [RewardConditionInteraction.YouTubeLike]: QuestVariant.YouTube,
    [RewardConditionInteraction.YouTubeSubscribe]: QuestVariant.YouTube,
    [RewardConditionInteraction.DiscordGuildJoined]: QuestVariant.Discord,
};
