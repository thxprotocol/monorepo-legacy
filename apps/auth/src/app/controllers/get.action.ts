import { Request, Response } from 'express';
import { DASHBOARD_URL } from '../config/secrets';

export const getAction = (_req: Request, res: Response) => {
    res.redirect(DASHBOARD_URL);
};
