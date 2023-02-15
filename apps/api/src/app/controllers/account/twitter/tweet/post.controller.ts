import { Request, Response } from 'express';
import { twitterClient } from '../user/post.controller';
import { body } from 'express-validator';

const validation = [body('tweetId').isString()];

const controller = async (req: Request, res: Response) => {
    const { data } = await twitterClient({
        method: 'GET',
        url: `/tweets`,
        params: {
            ids: req.body.tweetId,
            expansions: 'author_id',
        },
    });

    if (!data.data) return res.end();

    res.json({ tweet: data.data[0], user: data.includes.users[0] });
};

export default { controller, validation };
