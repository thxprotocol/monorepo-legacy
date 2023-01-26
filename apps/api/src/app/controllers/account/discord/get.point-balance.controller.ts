import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const { sub } = req.params;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const pointBalance = await PointBalance.findOne({ sub, poolId: pool._id });
    return res.json({ balance: pointBalance ? pointBalance.balance : 0 });
};
export default { controller };
