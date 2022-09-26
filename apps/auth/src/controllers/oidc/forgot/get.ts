import { Request, Response } from 'express';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;

    res.render('forgot', {
        uid,
        params,
        alert: {},
    });
}

export default { controller };
