import { Request, Response } from 'express';
import { body, check } from 'express-validator';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import { QuestVariant } from '@thxnetwork/common/lib/types';

const validation = [
    body('index').optional().isInt(),
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
    body('eventName').optional().isString(),
    body('expiryDate').optional().isISO8601(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
    body('locks')
        .optional()
        .custom((value) => {
            const locks = JSON.parse(value);
            return Array.isArray(locks);
        })
        .customSanitizer((locks) => JSON.parse(locks)),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const { title, description, amounts, infoLinks, eventName, isPublished, locks, expiryDate } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const quest = await QuestService.create(QuestVariant.Daily, poolId, {
        title,
        description,
        image,
        amounts,
        infoLinks,
        eventName,
        isPublished,
        expiryDate,
        locks,
    });

    res.status(201).json(quest);
};

export default { validation, controller };
