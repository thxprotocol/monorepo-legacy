import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amounts').custom((amounts) => {
        for (const amount of amounts) {
            if (isNaN(amount)) {
                return false;
            }
        }
        return true;
    }),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
    body('isEnabledWebhookQualification').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    const { title, description, amounts, infoLinks, isEnabledWebhookQualification } = req.body;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const dailyReward = await DailyRewardService.create(pool, {
        title,
        description,
        amounts,
        infoLinks,
        isEnabledWebhookQualification,
    });

    res.status(201).json(dailyReward);
};

export default { validation, controller };
