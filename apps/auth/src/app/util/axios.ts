import axios, { AxiosRequestConfig } from 'axios';
import {
    DISCORD_API_ENDPOINT,
    GITHUB_API_ENDPOINT,
    SHOPIFY_API_ENDPOINT,
    SPOTIFY_API_ENDPOINT,
    TWITCH_API_ENDPOINT,
    TWITTER_API_ENDPOINT,
} from '../config/secrets';

export function spotifyClient(config: AxiosRequestConfig) {
    config.baseURL = SPOTIFY_API_ENDPOINT;
    return axios(config);
}

export function twitterClient(config: AxiosRequestConfig) {
    config.baseURL = TWITTER_API_ENDPOINT;
    return axios(config);
}

export function githubClient(config: AxiosRequestConfig) {
    config.baseURL = GITHUB_API_ENDPOINT;
    return axios(config);
}

export function discordClient(config: AxiosRequestConfig) {
    config.baseURL = DISCORD_API_ENDPOINT;
    return axios(config);
}

export function twitchClient(config: AxiosRequestConfig) {
    config.baseURL = TWITCH_API_ENDPOINT;
    return axios(config);
}

export function shopifyClient(shopUrl: string, config: AxiosRequestConfig) {
    config.baseURL = shopUrl + SHOPIFY_API_ENDPOINT;
    return axios(config);
}
