import { RewardConditionInteraction } from '@thxnetwork/types/index';

import { DiscordService } from '../services/DiscordService';
import { TwitterService } from '../services/TwitterService';
import { YouTubeService } from '../services/YouTubeService';
import { GithubService } from './../services/GithubServices';

function getChannelScopes(channelAction: RewardConditionInteraction) {
    switch (channelAction) {
        case RewardConditionInteraction.YouTubeLike:
        case RewardConditionInteraction.YouTubeSubscribe:
            return { channelScopes: YouTubeService.getYoutubeScopes() };
        case RewardConditionInteraction.TwitterLike:
        case RewardConditionInteraction.TwitterRetweet:
        case RewardConditionInteraction.TwitterFollow:
            return { channelScopes: TwitterService.getScopes() };
    }
}

function getLoginLinkForChannelAction(uid: string) {
    return {
        googleLoginUrl: YouTubeService.getLoginUrl(uid, YouTubeService.getYoutubeScopes()),
        twitterLoginUrl: TwitterService.getLoginURL(uid, {}),
        githubLoginUrl: GithubService.getLoginURL(uid, {}),
        discordLoginUrl: DiscordService.getLoginURL(uid, {}),
    };
}

export { getChannelScopes, getLoginLinkForChannelAction };
