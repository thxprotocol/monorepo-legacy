import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
    body('limit').isInt(),
    param('id').isMongoId(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Milestone Rewards']
    const { title, description, amount, limit, infoLinks } = req.body;
    const milestoneReward = await MilestoneRewardService.edit(req.params.id, {
        title,
        description,
        amount,
        infoLinks,
        limit,
    });

    res.status(201).json(milestoneReward);
};

export default { controller, validation };
