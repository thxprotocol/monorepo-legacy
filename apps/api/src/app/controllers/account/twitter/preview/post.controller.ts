import { Request, Response } from 'express';
import axios from 'axios';

function twitterClient(config) {
    axios.defaults.baseURL = 'https://publish.twitter.com';
    return axios(config);
}

const controller = async (req: Request, res: Response) => {
    const { data } = await twitterClient({
        method: 'GET',
        url: `/oembed?url=${req.body.url}`,
    });
    res.json(data);
};

export default { controller };
