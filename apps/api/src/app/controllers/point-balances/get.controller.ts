import { Request, Response } from 'express';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Balances']
    const pointBalance = await PointBalance.findOne({ sub: req.auth.sub, poolId: req.assetPool._id });
    return res.json({ balance: pointBalance ? pointBalance.balance : 0 });
};

export default { controller };
