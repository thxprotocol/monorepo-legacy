import { Request, Response } from 'express';
import { param } from 'express-validator';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    await PoolSubscription.deleteOne({ poolId: req.params.id, sub: req.auth.sub });
    res.status(204).end();
};

export default { controller, validation };
