import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Widget } from '@thxnetwork/api/services/WidgetService';
import db from '@thxnetwork/api/util/database';

const validation = [body('color').isHexColor(), body('bgColor').isHexColor(), body('theme').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const widget = await Widget.create({
        poolId: req.header('X-PoolId'),
        uuid: db.createUUID(),
        color: req.body.color,
        bgColor: req.body.bgColor,
        theme: req.body.theme,
    });
    res.status(201).json(widget);
};

export default { controller, validation };
