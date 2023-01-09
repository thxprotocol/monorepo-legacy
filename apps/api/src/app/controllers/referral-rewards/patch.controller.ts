import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').exists(), body('successUrl').optional().isURL({ require_tld: false })];

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
