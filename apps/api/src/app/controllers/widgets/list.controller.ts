import { Request, Response } from 'express';
import { Widget } from '@thxnetwork/api/services/WidgetService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const widgets = await Widget.find({ poolId: req.assetPool._id });
    res.json(widgets);
};

export default { controller };
