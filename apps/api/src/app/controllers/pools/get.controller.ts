import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { Widget } from '@thxnetwork/api/services/WidgetService';
import BrandService from '@thxnetwork/api/services/BrandService';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool.address) return res.json(pool.toJSON());

    const widget = await Widget.findOne({ poolId: req.params.id });
    const brand = await BrandService.get(req.params.id);

    res.json({ ...pool.toJSON(), widget, brand, latestVersion: currentVersion });
};

export default { controller, validation };
