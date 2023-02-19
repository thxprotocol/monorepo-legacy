import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Widget } from '@thxnetwork/api/services/WidgetService';

const validation = [
    body('color').isHexColor(),
    body('bgColor').isHexColor(),
    body('message').isString().isLength({ min: 3, max: 280 }),
    body('theme').isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const widget = await Widget.findOneAndUpdate(
        { uuid: req.params.uuid },
        { color: req.body.color, message: req.body.message, bgColor: req.body.bgColor, theme: req.body.theme },
        { new: true },
    );
    res.json(widget);
};

export default { controller, validation };
