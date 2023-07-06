import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';

const validation = [
    param('id').isMongoId(),
    body('pathname').optional().isString(),
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
    const { title, description, pathname, amount, successUrl, infoLinks, isMandatoryReview, index } = req.body;
    reward = await ReferralReward.findByIdAndUpdate(
        reward._id,
        {
            title,
            description,
            amount,
            pathname,
            successUrl,
            isMandatoryReview,
            infoLinks,
            index,
        },
        { new: true },
    );
    const claims = await ReferralRewardClaimService.findByReferralReward(reward);
    res.json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
