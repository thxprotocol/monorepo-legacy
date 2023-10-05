import { TWITTER_API_TOKEN } from '@thxnetwork/api/config/secrets';
import axios, { AxiosRequestConfig } from 'axios';

export function twitterClient(config: AxiosRequestConfig) {
    axios.defaults.headers['Authorization'] = `Bearer ${TWITTER_API_TOKEN}`;
    axios.defaults.baseURL = 'https://api.twitter.com/2';
    return axios(config);
}
