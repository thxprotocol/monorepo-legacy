import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/api/util/url';

const validation = [
    param('id').exists(),
    body('successUrl').optional().isURL({ require_tld: false }),
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
    reward = await RewardReferralService.update(reward, req.body);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const claims = await ReferralRewardClaimService.findByReferralReward(reward);
    res.json({ ...reward.toJSON(), claims, poolAddress: pool.address });
};

export default { controller, validation };
