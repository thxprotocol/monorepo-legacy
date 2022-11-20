import { GithubService } from './../services/GithubServices';
import { TwitterService } from '../services/TwitterService';
import { YouTubeService } from '../services/YouTubeService';
import { ChannelAction } from '../models/Reward';
import { SPOTIFY_API_SCOPE, SpotifyService } from '../services/SpotifyService';
import { DiscordService } from '../services/DiscordService';

function getChannelScopes(channelAction: ChannelAction) {
    switch (channelAction) {
        case ChannelAction.YouTubeLike:
        case ChannelAction.YouTubeSubscribe:
            return { channelScopes: YouTubeService.getExpandedScopes() };
        case ChannelAction.TwitterLike:
        case ChannelAction.TwitterRetweet:
        case ChannelAction.TwitterFollow:
            return { channelScopes: TwitterService.getScopes() };
        case ChannelAction.SpotifyPlaylistFollow:
        case ChannelAction.SpotifyTrackPlaying:
        case ChannelAction.SpotifyTrackRecent:
        case ChannelAction.SpotifyTrackSaved:
        case ChannelAction.SpotifyUserFollow:
            return { channelScopes: SPOTIFY_API_SCOPE };
    }
}

function getLoginLinkForChannelAction(uid: string) {
    return {
        googleLoginUrl: YouTubeService.getLoginUrl(uid, YouTubeService.getExpandedScopes()),
        twitterLoginUrl: TwitterService.getLoginURL(uid, {}),
        spotifyLoginUrl: SpotifyService.getLoginURL(uid, {}),
        githubLoginUrl: GithubService.getLoginURL(uid, {}),
        discordLoginUrl: DiscordService.getLoginURL(uid, {}),
    };
}

export { getChannelScopes, getLoginLinkForChannelAction };
