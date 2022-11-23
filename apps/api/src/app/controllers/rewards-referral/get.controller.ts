import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import { RewardBaseDocument } from '@thxnetwork/api/models/RewardBase';
import { formatRewardReferral } from '../rewards-utils';
import RewardReferralService from '@thxnetwork/api/services/RewardReferralService';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsReferral']
    const reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ClaimService.findByReward((await reward.rewardBase) as RewardBaseDocument);

    const formattedReward = await formatRewardReferral(reward);
    res.json({ ...formattedReward, claims, poolAddress: req.assetPool.address });
};

export default { controller, validation };
