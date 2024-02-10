import axios, { AxiosRequestConfig } from 'axios';
import {
    DISCORD_API_ENDPOINT,
    GITHUB_API_ENDPOINT,
    TWITCH_API_ENDPOINT,
    TWITTER_API_ENDPOINT,
} from '../config/secrets';

export async function twitterClient(config: AxiosRequestConfig) {
    try {
        const client = axios.create({ ...config, baseURL: TWITTER_API_ENDPOINT });
        return await client(config);
    } catch (error) {
        throw error.response;
    }
}

export async function discordClient(config: AxiosRequestConfig) {
    try {
        const client = axios.create({ ...config, baseURL: DISCORD_API_ENDPOINT });
        return await client(config);
    } catch (error) {
        throw error.response;
    }
}

export async function githubClient(config: AxiosRequestConfig) {
    try {
        const client = axios.create({ ...config, baseURL: GITHUB_API_ENDPOINT });
        return await client(config);
    } catch (error) {
        throw error.response;
    }
}

export async function twitchClient(config: AxiosRequestConfig) {
    try {
        const client = axios.create({ ...config, baseURL: TWITCH_API_ENDPOINT });
        return await client(config);
    } catch (error) {
        throw error.response;
    }
}
