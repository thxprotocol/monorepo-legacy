import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';

const validation = [
    param('id').isMongoId(),
    body('index').optional().isInt(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('amount').optional().isInt({ gt: 0 }),
    body('limit').optional().isInt(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Milestone Rewards']
    const { title, description, amount, infoLinks, limit, index } = req.body;
    const milestoneReward = await MilestoneReward.findByIdAndUpdate(
        req.params.id,
        {
            title,
            description,
            amount,
            infoLinks,
            index,
            limit,
        },
        { new: true },
    );

    res.status(201).json(milestoneReward);
};

export default { controller, validation };
