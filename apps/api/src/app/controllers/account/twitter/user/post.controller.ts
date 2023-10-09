import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [body('userId').isString()];

const controller = async (req: Request, res: Response) => {
    const { data } = await authClient({
        method: 'POST',
        url: `/account/${req.auth.sub}/twitter/user`,
        data: { userId: req.body.userId },
        headers: { Authorization: await getAuthAccessToken() },
    });

    res.json(data.data);
};

export default { controller, validation };
