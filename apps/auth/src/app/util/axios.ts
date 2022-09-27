import axios, { AxiosRequestConfig } from 'axios';
import { SPOTIFY_API_ENDPOINT, TWITTER_API_ENDPOINT } from './secrets';

export function spotifyClient(config: AxiosRequestConfig) {
    config.baseURL = SPOTIFY_API_ENDPOINT;
    return axios(config);
}

export function twitterClient(config: AxiosRequestConfig) {
    config.baseURL = TWITTER_API_ENDPOINT;
    return axios(config);
}
