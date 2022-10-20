import { Request, Response } from 'express';
import { query } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [
    query('chainId').optional().isNumeric(),
    query('limit').optional().isNumeric(),
    query('page').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const response = await WalletService.findByQuery(
        { sub: req.auth.sub, chainId: Number(req.query.chainId) },
        Number(req.query.page),
        Number(req.query.limit),
    );

    res.send(response);
};

export default { controller };
