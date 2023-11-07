import { DailyReward } from '@thxnetwork/api/services/DailyRewardService';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('index').optional().isInt(),
    body('title').optional().isString(),
    body('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => JSON.parse(value)),
    body('description').optional().isString(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('amounts')
        .optional()
        .custom((amounts) => {
            for (const amount of JSON.parse(amounts)) {
                if (isNaN(amount)) {
                    return false;
                }
            }
            return true;
        })
        .customSanitizer((amounts) => JSON.parse(amounts)),
    body('expiryDate').optional().isISO8601(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
    body('isEnabledWebhookQualification').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Rewards']

    let quest = await DailyReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Could not find the dailyReward');

    const image = req.file && (await ImageService.upload(req.file));
    const { title, description, amounts, infoLinks, isEnabledWebhookQualification, index, isPublished, expiryDate } =
        req.body;

    quest = await QuestService.update(QuestVariant.Daily, req.params.id, {
        title,
        description,
        amounts,
        image,
        infoLinks,
        isEnabledWebhookQualification,
        index,
        isPublished,
        expiryDate,
    });

    return res.json(quest);
};

export default { controller, validation };
