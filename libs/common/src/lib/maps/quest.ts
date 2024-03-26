import { QuestVariant, QuestSocialRequirement, ReCaptchaAction } from '../enums';

export const questInteractionVariantMap = {
    [QuestSocialRequirement.TwitterFollow]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterLike]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterMessage]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterRetweet]: QuestVariant.Twitter,
    [QuestSocialRequirement.TwitterLikeRetweet]: QuestVariant.Twitter,
    [QuestSocialRequirement.YouTubeLike]: QuestVariant.YouTube,
    [QuestSocialRequirement.YouTubeSubscribe]: QuestVariant.YouTube,
    [QuestSocialRequirement.DiscordGuildJoined]: QuestVariant.Discord,
    [QuestSocialRequirement.DiscordMessage]: QuestVariant.Discord,
    [QuestSocialRequirement.DiscordMessageReaction]: QuestVariant.Discord,
};
export const recaptchaActionMap = {
    [QuestVariant.Daily]: ReCaptchaAction.QuestDailyEntryCreate,
    [QuestVariant.Twitter]: ReCaptchaAction.QuestSocialEntryCreate,
    [QuestVariant.YouTube]: ReCaptchaAction.QuestSocialEntryCreate,
    [QuestVariant.Discord]: ReCaptchaAction.QuestSocialEntryCreate,
    [QuestVariant.Custom]: ReCaptchaAction.QuestCustomEntryCreate,
    [QuestVariant.Gitcoin]: ReCaptchaAction.QuestGitcoinEntryCreate,
    [QuestVariant.Web3]: ReCaptchaAction.QuestWeb3EntryCreate,
};
