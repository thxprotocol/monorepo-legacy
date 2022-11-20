import { RewardConditionInteraction } from '@thxnetwork/types/index';

import { ChannelAction } from '../models/Reward';
import { DiscordService } from '../services/DiscordService';
import { TwitterService } from '../services/TwitterService';
import { YouTubeService } from '../services/YouTubeService';
import { GithubService } from './../services/GithubServices';

function getChannelScopes(channelAction: RewardConditionInteraction) {
    switch (channelAction) {
        case RewardConditionInteraction.YouTubeLike:
        case RewardConditionInteraction.YouTubeSubscribe:
            return { channelScopes: YouTubeService.getExpandedScopes() };
        case RewardConditionInteraction.TwitterLike:
        case RewardConditionInteraction.TwitterRetweet:
        case RewardConditionInteraction.TwitterFollow:
            return { channelScopes: TwitterService.getScopes() };
    }
}

function getLoginLinkForChannelAction(uid: string) {
    return {
        googleLoginUrl: YouTubeService.getLoginUrl(uid, YouTubeService.getExpandedScopes()),
        twitterLoginUrl: TwitterService.getLoginURL(uid, {}),
        githubLoginUrl: GithubService.getLoginURL(uid, {}),
        discordLoginUrl: DiscordService.getLoginURL(uid, {}),
    };
}

export { getChannelScopes, getLoginLinkForChannelAction };
