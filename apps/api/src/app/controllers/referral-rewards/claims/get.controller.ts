import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    const reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ReferralRewardClaimService.findByReferralReward(reward);
    res.json({ ...reward.toJSON(), claims, poolAddress: req.assetPool.address });
};

export default { controller, validation };
