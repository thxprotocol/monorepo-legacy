import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param, check } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    param('id').isMongoId(),
    body('pathname').optional().isString(),
    body('isPublished').optional().isBoolean(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('successUrl').optional().isURL({ require_tld: false }),
    body('index').optional().isInt(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    let reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward for this id');
    const { title, description, pathname, amount, successUrl, infoLinks, isMandatoryReview, index, isPublished } =
        req.body;
    const image = req.file && (await ImageService.upload(req.file));
    reward = await ReferralReward.findByIdAndUpdate(
        reward._id,
        {
            title,
            description,
            image,
            amount,
            pathname,
            successUrl,
            isMandatoryReview,
            infoLinks,
            index,
            isPublished,
        },
        { new: true },
    );
    const claims = await ReferralRewardClaimService.findByReferralReward(reward);

    PoolService.sendNotification(reward);

    res.json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
