import { Request, Response } from 'express';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const claim = await MilestoneRewardClaim.findOne({ uuid: req.params.uuid });
    if (!claim) throw new NotFoundError('No milestone reward claim for that uuid could be found.');

    const reward = await MilestoneReward.findById(claim.milestoneRewardId);
    if (!reward) throw new NotFoundError('No milestone reward for that claim could be found.');

    const pool = await PoolService.getById(reward.poolId);

    await PointBalanceService.add(pool, claim.sub, `${claim.amount}`);

    claim.isClaimed = true;
    await claim.save();

    res.status(201).json(claim);
};

export default { controller };
