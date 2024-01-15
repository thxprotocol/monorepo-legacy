import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { QuestVariant } from '@thxnetwork/types/enums';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import { v4 } from 'uuid';

const validation = [
    body('index').optional().isInt(),
    body('title').optional().isString(),
    body('pathname').optional().isString(),
    body('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => JSON.parse(value)),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('successUrl')
        .optional()
        .custom((value) => {
            if (value === '' || isValidUrl(value)) return true;
            return false;
        }),
    body('isMandatoryReview').optional().isBoolean(),
    body('amount').optional().isInt(),
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
    // #swagger.tags = ['Rewards Referral']
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));
    const {
        title,
        description,
        pathname,
        amount,
        successUrl,
        infoLinks,
        isMandatoryReview,
        index,
        isPublished,
        expiryDate,
        locks,
    } = req.body;
    const quest = await QuestService.create(QuestVariant.Invite, poolId, {
        index,
        title,
        description,
        token: v4(), // Webhook token
        pathname,
        isPublished,
        successUrl,
        isMandatoryReview,
        amount,
        infoLinks,
        image,
        expiryDate,
        locks,
    });

    res.status(201).json(quest);
};

export default { controller, validation };
