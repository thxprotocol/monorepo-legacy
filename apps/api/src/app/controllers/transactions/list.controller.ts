import { Request, Response } from 'express';
import { query } from 'express-validator';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const validation = [
    query('limit').optional().isInt({ gt: 0 }),
    query('page').optional().isInt({ gt: 0 }),
    query('startDate').optional().isNumeric(),
    query('endDate').optional().isNumeric()
];

const controller = async (req: Request, res: Response) => {
    const response = await TransactionService.findByQuery(
        req.assetPool.address,
        req.query.page ? Number(req.query.page) : null, // Will default to 1 if undefined
        req.query.limit ? Number(req.query.limit) : null, // Will default to 10 if undefined,
        req.query.startDate ? new Date(Number(req.query.startDate)) : null,
        req.query.endDate ? new Date(Number(req.query.endDate)) : null
    );

    res.send(response);
};

export default { controller, validation };
