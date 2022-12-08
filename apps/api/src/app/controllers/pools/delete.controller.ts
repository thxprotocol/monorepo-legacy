import { Request, Response } from 'express';
import { param } from 'express-validator';

import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ERC20PerkService from '@thxnetwork/api/services/ERC20PerkService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    await ERC20PerkService.removeAllForPool(req.assetPool);
    await ERC721PerkService.removeAllForPool(req.assetPool);
    await WithdrawalService.removeAllForPool(req.assetPool);
    await ClientProxy.remove(req.assetPool.clientId);
    await AssetPoolService.remove(req.assetPool);

    res.status(204).end();
};

export default { controller, validation };
