import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { currentVersion } from '@thxnetwork/contracts/exports';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool.address) return res.json(pool.toJSON());

    res.json({ ...pool.toJSON(), latestVersion: currentVersion });
};

export default { controller, validation };
