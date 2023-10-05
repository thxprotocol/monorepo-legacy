import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { QuestVariant } from '@thxnetwork/types/enums';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import { v4 } from 'uuid';

const validation = [
    body('index').isInt(),
    body('title').exists().isString(),
    body('pathname').optional().isString(),
    body('isPublished').optional().isBoolean(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('successUrl').optional().isURL({ require_tld: false }),
    body('isMandatoryReview').optional().isBoolean(),
    body('amount').exists().isInt({ gt: 0 }),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));
    const { title, description, pathname, amount, successUrl, infoLinks, isMandatoryReview, index, isPublished } =
        req.body;
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
    });

    res.status(201).json(quest);
};

export default { controller, validation };
