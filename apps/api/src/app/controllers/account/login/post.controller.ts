import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { Request, Response } from 'express';
import { body } from 'express-validator';

export const validation = [
    body('email').exists(),
    body('email', 'Email is not valid').isEmail(),
    body('password').exists(),
    body('password', 'Password must be at least 4 characters long').isLength({ min: 16 }),
];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const r = await authClient.post(
        '/account/login',
        { email: req.body.email, password: req.body.password },
        {
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        },
    );
    res.status(r.status).json(r.data);
};

export default { controller, validation };
