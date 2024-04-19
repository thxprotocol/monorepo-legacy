import BalancerService from '@thxnetwork/api/services/BalancerService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { query } from 'express-validator';

const validation = [query('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const wallet = await WalletService.findById(req.query.walletId as string);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const result = BalancerService.getMetrics(wallet);

    res.json(result);
};

export default { validation, controller };
