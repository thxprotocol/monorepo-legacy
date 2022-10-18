import { Request, Response } from 'express';
import WalletService from '@thxnetwork/api/services/WalletService';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const assetPool = await AssetPoolService.getById(req.assetPool.id);
    const wallet = await WalletService.create(assetPool);

    res.status(201).json(wallet);
};

export default { controller };
