import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import { Request, Response } from 'express';
import { body, check } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';

const validation = [
    body('index').isInt(),
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('platform').isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('contentMetadata').optional().isString(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    const { title, description, amount, infoLinks, platform, interaction, content, contentMetadata } = req.body;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const reward = await PointRewardService.create(pool, {
        title,
        description,
        amount,
        platform,
        interaction,
        content,
        contentMetadata,
        infoLinks,
    });
    res.status(201).json(reward);
};

export default { validation, controller };
