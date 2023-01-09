import { Request, Response } from 'express';
import { Widget } from '@thxnetwork/api/services/WidgetService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const widgets = await Widget.find({ poolId: req.header('X-PoolId') });
    res.json(widgets);
};

export default { controller };
