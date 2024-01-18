import { Request, Response } from 'express';
import { WIDGET_URL } from '../config/secrets';

export const getAction = (_req: Request, res: Response) => {
    res.redirect(WIDGET_URL);
};
