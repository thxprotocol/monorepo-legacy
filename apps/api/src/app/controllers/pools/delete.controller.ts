import { Request, Response } from 'express';
import { param } from 'express-validator';

import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import RewardService from '@thxnetwork/api/services/RewardService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    await RewardService.removeAllForPool(req.assetPool);
    await WithdrawalService.removeAllForPool(req.assetPool);
    await ClientProxy.remove(req.assetPool.clientId);
    await AssetPoolService.remove(req.assetPool);

    res.status(204).end();
};

export default { controller, validation };
