import { Request, Response } from 'express';
import { param } from 'express-validator';

import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ERC20RewardService from '@thxnetwork/api/services/ERC20RewardService';
import ERC721RewardService from '@thxnetwork/api/services/ERC721RewardService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    await ERC20RewardService.removeAllForPool(req.assetPool);
    await ERC721RewardService.removeAllForPool(req.assetPool);
    await WithdrawalService.removeAllForPool(req.assetPool);
    await ClientProxy.remove(req.assetPool.clientId);
    await AssetPoolService.remove(req.assetPool);

    res.status(204).end();
};

export default { controller, validation };
