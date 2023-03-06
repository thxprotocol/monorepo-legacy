import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Widget } from '@thxnetwork/api/services/WidgetService';

const validation = [
    body('color').isHexColor(),
    body('bgColor').isHexColor(),
    body('align').isString(),
    body('theme').isString(),
    body('domain').optional().isURL({ require_tld: false }),
    body('message').optional().isString().isLength({ max: 280 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const widget = await Widget.findOneAndUpdate(
        { uuid: req.params.uuid },
        {
            color: req.body.color,
            align: req.body.align,
            domain: req.body.domain,
            message: req.body.message,
            bgColor: req.body.bgColor,
            theme: req.body.theme,
        },
        { new: true },
    );
    return res.json(widget);
};

export default { controller, validation };
