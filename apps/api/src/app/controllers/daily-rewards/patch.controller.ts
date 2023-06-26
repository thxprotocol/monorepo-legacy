import { DailyReward } from '@thxnetwork/api/services/DailyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('index').optional().isNumeric(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('index').optional().isInt(),
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
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
    body('isEnabledWebhookQualification').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Rewards']

    let dailyReward = await DailyReward.findById(req.params.id);
    if (!dailyReward) throw new NotFoundError('Could not find the dailyReward');

    const { title, description, amounts, infoLinks, isEnabledWebhookQualification, index } = req.body;
    dailyReward = await DailyReward.findByIdAndUpdate(
        req.params.id,
        {
            title,
            description,
            amounts,
            infoLinks,
            isEnabledWebhookQualification,
            index,
        },
        { new: true },
    );

    return res.json(dailyReward);
};

export default { controller, validation };
