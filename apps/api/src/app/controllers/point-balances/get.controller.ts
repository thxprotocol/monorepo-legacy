import { Request, Response } from 'express';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Balances']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const pointBalance = await PointBalance.findOne({ sub: req.auth.sub, poolId: pool._id });
    return res.json({ balance: pointBalance ? pointBalance.balance : 0 });
};

export default { controller };
