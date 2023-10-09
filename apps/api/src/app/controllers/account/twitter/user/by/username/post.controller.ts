import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [body('username').isString()];

const controller = async (req: Request, res: Response) => {
    const { data } = await authClient({
        method: 'POST',
        url: `/account/${req.auth.sub}/twitter/user/by/username`,
        data: { username: req.body.username },
        headers: { Authorization: await getAuthAccessToken() },
    });

    res.json(data.data);
};

export default { controller, validation };
