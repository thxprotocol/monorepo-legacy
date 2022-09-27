import { Request, Response } from 'express';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    res.render('reset', { uid, params });
}

export default { controller };
