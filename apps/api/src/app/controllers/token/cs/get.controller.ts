import { Request, Response } from 'express';
import { CIRCULATING_SUPPLY } from '@thxnetwork/api/config/secrets';

const controller = async (req: Request, res: Response) => {
    res.header('Content-Type', 'text/plain').send(CIRCULATING_SUPPLY);
};

export { controller };
