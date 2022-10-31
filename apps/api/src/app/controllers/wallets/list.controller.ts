import { Request, Response } from 'express';
import { query } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [query('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const response = await WalletService.findByQuery({ sub: req.auth.sub, chainId: Number(req.query.chainId) });
    res.send(response);
};

export default { controller };
