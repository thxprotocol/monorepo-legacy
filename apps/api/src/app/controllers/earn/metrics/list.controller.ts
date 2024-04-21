import BalancerService from '@thxnetwork/api/services/BalancerService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { ChainId } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { query } from 'express-validator';

const validation = [query('walletId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    const wallet = await WalletService.findById(req.query.walletId as string);
    const result = BalancerService.getMetrics(wallet ? wallet.chainId : ChainId.Polygon);

    res.json(result);
};

export default { validation, controller };
