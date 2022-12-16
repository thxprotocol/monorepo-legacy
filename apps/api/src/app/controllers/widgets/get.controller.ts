import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Widget } from '@thxnetwork/api/services/WidgetService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const widget = await Widget.findOne({ uuid: req.params.uuid });
    res.json(widget);
};

export default { controller, validation };
