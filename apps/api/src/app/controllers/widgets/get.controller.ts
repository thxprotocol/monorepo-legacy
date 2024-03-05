import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Widget } from '@thxnetwork/api/models';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    const widget = await Widget.findOne({ uuid: req.params.uuid });
    res.json(widget);
};

export default { controller, validation };
