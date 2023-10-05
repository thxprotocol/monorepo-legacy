import { TWITTER_API_TOKEN } from '@thxnetwork/api/config/secrets';
import axios, { AxiosRequestConfig } from 'axios';

export function twitterClient(config: AxiosRequestConfig, accessToken?: string) {
    axios.defaults.headers['Authorization'] = `Bearer ${accessToken || TWITTER_API_TOKEN}`;
    axios.defaults.baseURL = 'https://api.twitter.com/2';
    return axios(config);
}
