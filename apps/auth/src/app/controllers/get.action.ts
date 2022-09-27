import { Request, Response } from 'express';
import { DASHBOARD_URL } from '../util/secrets';

export const getAction = (_req: Request, res: Response) => {
    res.redirect(DASHBOARD_URL);
};
