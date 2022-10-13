import { Request, Response } from 'express';
import Wallet from '@thxnetwork/api/models/Wallet';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const address = '';
    await Wallet.create({ address, poolId: req.assetPool.id });

    res.status(204).send();
};

export default { controller };
