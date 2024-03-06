import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Widget } from '@thxnetwork/api/models';

const validation = [
    body('isPublished').optional().isBoolean(),
    body('iconImg').optional().isString(),
    body('align').optional().isString(),
    body('theme').optional().isString(),
    body('cssSelector').optional().isString(),
    body('domain').optional().isURL({ require_tld: false }),
    body('message').optional().isString().isLength({ max: 280 }).trim().escape(),
];

const controller = async (req: Request, res: Response) => {
    const widget = await Widget.findOneAndUpdate(
        { uuid: req.params.uuid },
        {
            isPublished: req.body.isPublished,
            iconImg: req.body.iconImg,
            color: req.body.color,
            align: req.body.align,
            domain: req.body.domain,
            message: req.body.message,
            theme: req.body.theme,
            cssSelector: req.body.cssSelector,
        },
        { new: true },
    );
    return res.json(widget);
};

export default { controller, validation };
