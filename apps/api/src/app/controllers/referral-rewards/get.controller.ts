import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsReferral']
    const reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ClaimService.findByReward(reward);
    res.json({ ...reward.toJSON(), claims, poolAddress: req.assetPool.address });
};

export default { controller, validation };
