import { Request, Response } from 'express';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    res.render('signup', { uid, params });
}

export default { controller };
