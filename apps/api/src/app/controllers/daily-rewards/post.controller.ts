import { Request, Response } from 'express';
import { body, check } from 'express-validator';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import ImageService from '@thxnetwork/api/services/ImageService';

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
    body('amounts')
        .custom((amounts) => {
            for (const amount of JSON.parse(amounts)) {
                if (isNaN(amount)) {
                    return false;
                }
            }
            return true;
        })
        .customSanitizer((amounts) => JSON.parse(amounts)),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
    body('isEnabledWebhookQualification').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    const { title, description, amounts, infoLinks, isEnabledWebhookQualification, isPublished } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const reward = await DailyRewardService.create(pool, {
        title,
        description,
        image,
        amounts,
        infoLinks,
        isEnabledWebhookQualification,
        isPublished,
    });

    PoolService.sendNotification(reward);

    res.status(201).json(reward);
};

export default { validation, controller };
