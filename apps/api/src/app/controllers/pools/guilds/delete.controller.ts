import { param } from 'express-validator';
import { Request, Response } from 'express';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    res.status(204).end();
};

export default { controller, validation };
