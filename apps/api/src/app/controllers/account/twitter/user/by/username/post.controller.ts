import { Request, Response } from 'express';
import { twitterClient } from '../../post.controller';
import { body } from 'express-validator';

const validation = [body('username').isString()];

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

export default { controller, validation };
