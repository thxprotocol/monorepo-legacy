import { Request, Response } from 'express';
import { param } from 'express-validator';

import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import RewardBaseService from '@thxnetwork/api/services/RewardBaseService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    await RewardBaseService.removeAllForPool(req.assetPool);
    await WithdrawalService.removeAllForPool(req.assetPool);
    await ClientProxy.remove(req.assetPool.clientId);
    await AssetPoolService.remove(req.assetPool);

    res.status(204).end();
};

export default { controller, validation };
