import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { questInteractionVariantMap } from '@thxnetwork/common/lib/types';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, param, check } from 'express-validator';

const validation = [
    param('id').exists(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => JSON.parse(value)),
    body('amount').optional().isInt({ gt: 0 }),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('platform').optional().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('index').optional().isInt(),
    body('content').optional().isString(),
    body('content').optional().isString(),
    body('contentMetadata').optional().isString(),
    body('expiryDate').optional().isISO8601(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Quest Social']
    const {
        title,
        description,
        amount,
        infoLinks,
        limit,
        index,
        isPublished,
        platform,
        interaction,
        content,
        contentMetadata,
        expiryDate,
    } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const variant = questInteractionVariantMap[interaction];
    const quest = await QuestService.update(variant, req.params.id, {
        title,
        description,
        amount,
        infoLinks,
        limit,
        index,
        isPublished,
        platform,
        interaction,
        content,
        contentMetadata,
        image,
        expiryDate,
    });

    res.json(quest);
};

export default { controller, validation };
