import { AccessTokenKind, QuestSocialRequirement, OAuthScope, OAuthRequiredScopes } from '@thxnetwork/common/enums';
import { logger } from '@thxnetwork/api/util/logger';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';

export const requirementMap: {
    [interaction: number]: (account: TAccount, quest: TQuestSocial) => Promise<TValidationResult>;
} = {
    [QuestSocialRequirement.YouTubeLike]: async (account, quest) => {
        return await YouTubeDataProxy.validateLike(account, quest.content);
    },
    [QuestSocialRequirement.YouTubeSubscribe]: async (account, quest) => {
        return await YouTubeDataProxy.validateSubscribe(account, quest.content);
    },
    [QuestSocialRequirement.TwitterLike]: async (account, quest) => {
        logger.info(`[${quest.poolId}][${account.sub}] X Quest ${quest._id} Like verification started`);

        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultLike = await TwitterDataProxy.validateLike(account, quest);
        if (!validationResultLike.result) return validationResultLike;
    },
    [QuestSocialRequirement.TwitterRetweet]: async (account, quest) => {
        logger.info(`[${quest.poolId}][${account.sub}] X Quest ${quest._id} Repost verification started`);

        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultRepost = await TwitterDataProxy.validateRetweet(account, quest);
        if (!validationResultRepost.result) return validationResultRepost;
    },
    [QuestSocialRequirement.TwitterLikeRetweet]: async (account, quest) => {
        logger.info(`[${quest.poolId}][${account.sub}] X Quest ${quest._id} LikeRepost verification started`);

        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultLike = await TwitterDataProxy.validateLike(account, quest);
        if (!validationResultLike.result) return validationResultLike;
        const validationResultRepost = await TwitterDataProxy.validateRetweet(account, quest);
        if (!validationResultRepost.result) return validationResultRepost;
    },
    [QuestSocialRequirement.TwitterFollow]: async (account, quest) => {
        logger.info(`[${quest.poolId}][${account.sub}] X Quest ${quest._id} Follow verification started`);

        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser.result) return resultUser;
        const validationResultFollow = await TwitterDataProxy.validateFollow(account, quest.content);
        if (!validationResultFollow.result) return validationResultFollow;
    },
    [QuestSocialRequirement.TwitterQuery]: async (account, quest) => {
        logger.info(`[${quest.poolId}][${account.sub}] X Quest ${quest._id} Message verification started`);
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser.result) return resultUser;
        const validationResultMessage = await TwitterDataProxy.validateQuery(account, quest);
        if (!validationResultMessage.result) return validationResultMessage;
    },
    [QuestSocialRequirement.DiscordGuildJoined]: async (account, quest) => {
        return await DiscordDataProxy.validateGuildJoined(account, quest.content);
    },
    [QuestSocialRequirement.DiscordMessage]: async (account, quest) => {
        return { result: true, reason: '' };
    },
    [QuestSocialRequirement.DiscordMessageReaction]: async (account, quest) => {
        return { result: true, reason: '' };
    },
};

export const tokenInteractionMap: { [interaction: number]: { kind: AccessTokenKind; scopes: OAuthScope[] } } = {
    [QuestSocialRequirement.YouTubeLike]: {
        kind: AccessTokenKind.Google,
        scopes: OAuthRequiredScopes.GoogleYoutubeLike,
    },
    [QuestSocialRequirement.YouTubeSubscribe]: {
        kind: AccessTokenKind.Google,
        scopes: OAuthRequiredScopes.GoogleYoutubeSubscribe,
    },
    [QuestSocialRequirement.TwitterLike]: {
        kind: AccessTokenKind.Twitter,
        scopes: OAuthRequiredScopes.TwitterValidateLike,
    },
    [QuestSocialRequirement.TwitterRetweet]: {
        kind: AccessTokenKind.Twitter,
        scopes: OAuthRequiredScopes.TwitterValidateRepost,
    },
    [QuestSocialRequirement.TwitterFollow]: {
        kind: AccessTokenKind.Twitter,
        scopes: OAuthRequiredScopes.TwitterValidateFollow,
    },
    [QuestSocialRequirement.TwitterQuery]: { kind: AccessTokenKind.Twitter, scopes: OAuthRequiredScopes.TwitterAuth },
    [QuestSocialRequirement.TwitterLikeRetweet]: {
        kind: AccessTokenKind.Twitter,
        scopes: OAuthRequiredScopes.TwitterValidateLike,
    },
    [QuestSocialRequirement.DiscordGuildJoined]: {
        kind: AccessTokenKind.Discord,
        scopes: OAuthRequiredScopes.DiscordValidateGuild,
    },
    [QuestSocialRequirement.DiscordMessage]: {
        kind: AccessTokenKind.Discord,
        scopes: OAuthRequiredScopes.DiscordAuth,
    },
    [QuestSocialRequirement.DiscordMessageReaction]: {
        kind: AccessTokenKind.Discord,
        scopes: OAuthRequiredScopes.DiscordAuth,
    },
};
