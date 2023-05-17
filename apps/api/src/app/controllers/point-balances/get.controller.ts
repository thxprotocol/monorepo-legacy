import { Request, Response } from 'express';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Wallet } from '@thxnetwork/api/models/Wallet';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Balances']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const wallet = await Wallet.findOne({ sub: req.auth.sub, chainId: pool.chainId });
    const pointBalance = await PointBalance.findOne({ walletId: wallet._id, poolId: pool._id });

    return res.json({ balance: pointBalance ? pointBalance.balance : 0 });
};

export default { controller };
