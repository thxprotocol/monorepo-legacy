import { Request, Response } from 'express';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import PoolService from '@thxnetwork/api/services/PoolService';
import WalletService from '@thxnetwork/api/services/WalletService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Balances']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const primaryWallet = await WalletService.findPrimary(req.auth.sub, pool.chainId);
    if (!primaryWallet) return res.json({ balance: 0 });

    const pointBalance = await PointBalance.findOne({ walletId: primaryWallet._id, poolId: pool._id });
    return res.json({ balance: pointBalance ? pointBalance.balance : 0 });
};

export default { controller };
