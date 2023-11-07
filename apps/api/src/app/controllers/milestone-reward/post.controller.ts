import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { QuestVariant } from '@thxnetwork/types/enums';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, check } from 'express-validator';

const validation = [
    body('index').isInt(),
    body('title').isString(),
    body('description').isString(),
    body('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => JSON.parse(value)),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('amount').isInt({ gt: 0 }),
    body('expiryDate').optional().isISO8601(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
    body('limit').optional().isInt(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const poolId = req.header('X-PoolId');
    const { title, description, amount, limit, infoLinks, isPublished, expiryDate } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const quest = await QuestService.create(QuestVariant.Custom, poolId, {
        title,
        description,
        image,
        amount,
        infoLinks,
        limit,
        isPublished,
        expiryDate,
    });

    res.status(201).json(quest);
};

export default { controller, validation };
