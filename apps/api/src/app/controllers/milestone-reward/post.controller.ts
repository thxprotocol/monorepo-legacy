import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, check } from 'express-validator';

const validation = [
    body('index').isInt(),
    body('title').isString(),
    body('description').isString(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('amount').isInt({ gt: 0 }),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
    body('limit').optional().isInt(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { title, description, amount, limit, infoLinks } = req.body;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const milestoneReward = await MilestoneRewardService.create(pool, {
        title,
        description,
        amount,
        infoLinks,
        limit,
    });

    res.status(201).json(milestoneReward);
};

export default { controller, validation };
