import { Request, Response } from 'express';
import { param } from 'express-validator';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const tx = await TransactionService.getById(req.params.id);
    res.send(tx);
};

export default { controller, validation };
