import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Widget } from '@thxnetwork/api/services/WidgetService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    await Widget.deleteOne({ uuid: req.params.uuid });
    res.status(204).end();
};

export default { controller, validation };
