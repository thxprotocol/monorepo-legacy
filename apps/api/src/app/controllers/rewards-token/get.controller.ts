import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import { RewardBaseDocument } from '@thxnetwork/api/models/RewardBase';
import RewardTokenService from '@thxnetwork/api/services/RewardTokenService';
import { formatRewardToken } from '../rewards-utils';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const reward = await RewardTokenService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ClaimService.findByReward((await reward.rewardBase) as RewardBaseDocument);
    const withdrawals = await WithdrawalService.findByQuery({
        poolId: String(req.assetPool._id),
        rewardId: reward.id,
    });
    const formattedReward = await formatRewardToken(reward);
    res.json({ ...formattedReward, claims, poolAddress: req.assetPool.address, progress: withdrawals.length });
};

export default { controller, validation };
