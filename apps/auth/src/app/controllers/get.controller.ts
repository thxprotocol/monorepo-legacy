import { Request, Response } from 'express';
import { WIDGET_URL } from '../config/secrets';

const controller = (_req: Request, res: Response) => {
    res.redirect(WIDGET_URL);
};

export default { controller };
