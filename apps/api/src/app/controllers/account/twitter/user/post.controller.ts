import { TWITTER_API_TOKEN } from '@thxnetwork/api/config/secrets';
import axios, { AxiosRequestConfig } from 'axios';
import { Request, Response } from 'express';

export function twitterClient(config: AxiosRequestConfig) {
    axios.defaults.headers['Authorization'] = `Bearer ${TWITTER_API_TOKEN}`;
    axios.defaults.baseURL = 'https://api.twitter.com/2';
    return axios(config);
}

const controller = async (req: Request, res: Response) => {
    const { data } = await twitterClient({
        method: 'GET',
        url: `/users/by/username/${req.body.username}`,
        params: {
            'user.fields': 'profile_image_url',
        },
    });

    res.json(data.data);
};

export default { controller };
