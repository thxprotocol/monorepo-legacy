import { Request, Response } from 'express';
import { body } from 'express-validator';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';

const validation = [body('tweetId').isString()];

const controller = async (req: Request, res: Response) => {
    const { data } = await authClient({
        method: 'POST',
        url: `/account/${req.auth.sub}/twitter/tweet`,
        data: { tweetId: req.body.tweetId },
        headers: { Authorization: await getAuthAccessToken() },
    });
    if (data.error) return res.json(data);
    res.json({ tweet: data.data[0], user: data.includes.users[0] });
};

export default { controller, validation };
