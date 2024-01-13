import { param } from 'express-validator';
import { Request, Response } from 'express';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    res.json();
};

export default { controller, validation };
