import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { Widget } from '@thxnetwork/api/models/Widget';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widget']
    const widget = await Widget.findOne({ poolId: req.params.id });
    const pool = await AssetPool.findById(req.params.id);

    res.json({ ...widget.toJSON(), title: pool.settings.title });
};

export default { controller, validation };
