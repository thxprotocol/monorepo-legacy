import ImageService from '@thxnetwork/api/services/ImageService';
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
    body('isPublished').optional().isBoolean(),
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
    const { title, description, amount, limit, infoLinks, isPublished } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const reward = await MilestoneRewardService.create(pool, {
        title,
        description,
        image,
        amount,
        infoLinks,
        limit,
        isPublished,
    });

    PoolService.sendNotification(reward);

    res.status(201).json(reward);
};

export default { controller, validation };
