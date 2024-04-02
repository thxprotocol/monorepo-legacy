import { Request, Response } from 'express';
import { query, body } from 'express-validator';

export const validation = [body('amountInWei').isString(), query('walletId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    res.status(201).json();
};
export default { controller, validation };
