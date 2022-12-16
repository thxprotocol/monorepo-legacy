import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Widget } from '@thxnetwork/api/services/WidgetService';

const validation = [body('color').isHexColor(), body('bgColor').isHexColor()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    let widget = await Widget.findOne({ uuid: req.params.uuid });
    widget = await Widget.findByIdAndUpdate(widget._id, {
        color: req.body.color,
        bgColor: req.body.bgColor,
    });

    res.json(widget);
};

export default { controller, validation };
