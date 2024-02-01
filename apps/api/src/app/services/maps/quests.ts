import { TAccount, TPointReward, TValidationResult } from '@thxnetwork/types/interfaces';
import { RewardConditionPlatform, AccessTokenKind, RewardConditionInteraction } from '@thxnetwork/types/enums';

import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';

export const requirementMap: {
    [interaction: number]: (account: TAccount, quest: TPointReward) => Promise<TValidationResult>;
} = {
    [RewardConditionInteraction.YouTubeLike]: async (account, quest) => {
        const result = await YouTubeDataProxy.validateLike(account, quest.content);
        if (!result) return { result: false, reason: 'Youtube: Video has not been liked.' };
    },
    [RewardConditionInteraction.YouTubeSubscribe]: async (account, quest) => {
        const result = await YouTubeDataProxy.validateSubscribe(account, quest.content);
        if (!result) return { result: false, reason: 'Youtube: Not subscribed to channel.' };
    },
    [RewardConditionInteraction.TwitterLike]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultLike = await TwitterDataProxy.validateLike(account, quest.content);
        if (!validationResultLike.result) return validationResultLike;
    },
    [RewardConditionInteraction.TwitterRetweet]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultRepost = await TwitterDataProxy.validateRetweet(account, quest.content);
        if (!validationResultRepost.result) return validationResultRepost;
    },
    [RewardConditionInteraction.TwitterLikeRetweet]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultLike = await TwitterDataProxy.validateLike(account, quest.content);
        if (!validationResultLike.result) return validationResultLike;
        const validationResultRepost = await TwitterDataProxy.validateRetweet(account, quest.content);
        if (!validationResultRepost.result) return validationResultRepost;
    },
    [RewardConditionInteraction.TwitterFollow]: async (account, quest) => {
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser.result) return resultUser;
        const validationResultFollow = await TwitterDataProxy.validateFollow(account, quest.content);
        if (!validationResultFollow.result) return validationResultFollow;
    },
    [RewardConditionInteraction.TwitterMessage]: async (account, quest) => {
        const validationResultMessage = await TwitterDataProxy.validateMessage(account, quest.content);
        if (!validationResultMessage.result) return validationResultMessage;
    },
    [RewardConditionInteraction.DiscordGuildJoined]: async (account, quest) => {
        const validationResultMember = await DiscordDataProxy.validateGuildJoined(account, quest.content);
        if (!validationResultMember.result) return validationResultMember;
    },
    [RewardConditionInteraction.DiscordMessage]: async (account, quest) => {
        return { result: true, reason: '' };
    },
    [RewardConditionInteraction.DiscordMessageReaction]: async (account, quest) => {
        return { result: true, reason: '' };
    },
};

export const platformInteractionMap = {
    [RewardConditionInteraction.YouTubeLike]: RewardConditionPlatform.Google,
    [RewardConditionInteraction.YouTubeSubscribe]: RewardConditionPlatform.Google,
    [RewardConditionInteraction.TwitterLike]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.TwitterRetweet]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.TwitterFollow]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.DiscordGuildJoined]: RewardConditionPlatform.Discord,
    [RewardConditionInteraction.TwitterMessage]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.TwitterLikeRetweet]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.DiscordMessage]: RewardConditionPlatform.Discord,
    [RewardConditionInteraction.DiscordMessageReaction]: RewardConditionPlatform.Discord,
};

export const getPlatformUserId = async (account: TAccount, platform: RewardConditionPlatform) => {
    if (!platform) return;

    const getUserId = (account: TAccount, kind: AccessTokenKind) => {
        const token = account.connectedAccounts.find((a) => a.kind === kind);
        return token && token.userId;
    };

    const map = {
        [RewardConditionPlatform.Google]: getUserId(account, AccessTokenKind.YoutubeManage),
        [RewardConditionPlatform.Twitter]: getUserId(account, AccessTokenKind.Twitter),
        [RewardConditionPlatform.Discord]: getUserId(account, AccessTokenKind.Discord),
    };

    return map[platform];
};
