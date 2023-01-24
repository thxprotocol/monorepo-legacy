import { Request, Response } from 'express';
import { query } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [query('chainId').optional().isNumeric(), query('sub').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const response = await WalletService.findByQuery(req.query);
    res.send(response);
};

export default { controller, validation };
