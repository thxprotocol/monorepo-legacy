import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Widget } from '@thxnetwork/api/services/WidgetService';

const validation = [param('clientId').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const widget = await Widget.findOne({ poolId: req.assetPool._id, uuid: req.body.uuid });
    res.json(widget);
};

export default { controller, validation };
