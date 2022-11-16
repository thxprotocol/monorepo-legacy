import { Request, Response } from 'express';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Balances']
    const balance = await PointBalance.find({ sub: req.auth.sub, poolId: req.assetPool._id });
    res.json({ balance });
};

export default { controller };
