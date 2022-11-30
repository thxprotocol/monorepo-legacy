import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';

const validation = [param('id').exists(), body('successUrl').optional().isURL()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsReferral']
    let reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward for this id');
    reward = await RewardReferralService.update(reward, req.body);
    const claims = await ReferralRewardClaimService.findByReferralReward(reward);
    res.json({ ...reward.toJSON(), claims, poolAddress: req.assetPool.address });
};

export default { controller, validation };
