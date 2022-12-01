import { Request, Response } from 'express';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    const reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError();
    await ReferralRewardClaimService.create({ referralRewardId: reward._id, sub: req.auth.sub });
    const claims = await ReferralRewardClaimService.findBySub(reward, req.auth.sub);

    res.status(201).json({ ...reward.toJSON(), claims, poolAddress: req.assetPool.address });
};

export default { controller, validation };
