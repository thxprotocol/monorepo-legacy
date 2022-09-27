import { Request, Response } from 'express';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['THX Token']
    res.header('Content-Type', 'text/plain').send('100000000');
};

export default { controller };
