import { TAccount, TPointReward, TValidationResult } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, QuestSocialRequirement, OAuthScope, OAuthRequiredScopes } from '@thxnetwork/types/enums';

import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';

export const requirementMap: {
    [interaction: number]: (account: TAccount, quest: TPointReward) => Promise<TValidationResult>;
} = {
    [QuestSocialRequirement.YouTubeLike]: async (account, quest) => {
        return await YouTubeDataProxy.validateLike(account, quest.content);
    },
    [QuestSocialRequirement.YouTubeSubscribe]: async (account, quest) => {
        return await YouTubeDataProxy.validateSubscribe(account, quest.content);
    },
    [QuestSocialRequirement.TwitterLike]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultLike = await TwitterDataProxy.validateLike(account, quest.content);
        if (!validationResultLike.result) return validationResultLike;
    },
    [QuestSocialRequirement.TwitterRetweet]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultRepost = await TwitterDataProxy.validateRetweet(account, quest.content);
        if (!validationResultRepost.result) return validationResultRepost;
    },
    [QuestSocialRequirement.TwitterLikeRetweet]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultLike = await TwitterDataProxy.validateLike(account, quest.content);
        if (!validationResultLike.result) return validationResultLike;
        const validationResultRepost = await TwitterDataProxy.validateRetweet(account, quest.content);
        if (!validationResultRepost.result) return validationResultRepost;
    },
    [QuestSocialRequirement.TwitterFollow]: async (account, quest) => {
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser.result) return resultUser;
        const validationResultFollow = await TwitterDataProxy.validateFollow(account, quest.content);
        if (!validationResultFollow.result) return validationResultFollow;
    },
    [QuestSocialRequirement.TwitterMessage]: async (account, quest) => {
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser.result) return resultUser;
        const validationResultMessage = await TwitterDataProxy.validateMessage(account, quest.content);
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

const tokenInteractionMap: { [interaction: number]: { kind: AccessTokenKind; scopes: OAuthScope[] } } = {
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
    [QuestSocialRequirement.TwitterMessage]: { kind: AccessTokenKind.Twitter, scopes: OAuthRequiredScopes.TwitterAuth },
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

export function getToken(account: TAccount, kind: AccessTokenKind, requiredScopes: OAuthScope[] = []) {
    return account.tokens.find(
        (token) => token.kind === kind && requiredScopes.every((scope) => token.scopes.includes(scope)),
    );
}

export const getPlatformUserId = (account: TAccount, interaction: QuestSocialRequirement) => {
    if (typeof interaction === 'undefined') return;
    const { kind } = tokenInteractionMap[interaction];
    const token = getToken(account, kind);

    return token && token.userId;
};
