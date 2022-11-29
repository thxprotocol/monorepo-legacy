import axios, { AxiosRequestConfig } from 'axios';
import { GITHUB_API_ENDPOINT, TWITTER_API_ENDPOINT } from '../config/secrets';

export function twitterClient(config: AxiosRequestConfig) {
    config.baseURL = TWITTER_API_ENDPOINT;
    return axios(config);
}

export function githubClient(config: AxiosRequestConfig) {
    config.baseURL = GITHUB_API_ENDPOINT;
    return axios(config);
}
