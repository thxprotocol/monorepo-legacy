import { Request, Response } from 'express';
import { param } from 'express-validator';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const poolsubscription = await PoolSubscription.findOne({ poolId: req.params.id, sub: req.auth.sub });
    const result = poolsubscription ? poolsubscription.toJSON() : null;
    return res.json(result);
};

export default { controller, validation };
