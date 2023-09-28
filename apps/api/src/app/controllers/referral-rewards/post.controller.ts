import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/api/util/url';
import ImageService from '@thxnetwork/api/services/ImageService';

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
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const image = req.file && (await ImageService.upload(req.file));
    const reward = await ReferralRewardService.create(pool, { ...req.body, image, poolId: pool._id });

    PoolService.sendNotification(reward);

    res.status(201).json(reward);
};

export default { controller, validation };
