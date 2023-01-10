import { Request, Response } from 'express';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await MilestoneReward.findOne({ uuid: req.params.uuid });
    const pool = await PoolService.getById(reward.poolId);

    const claims = await MilestoneRewardClaim.find({
        poolId: pool.id,
        sub: req.auth.sub,
        isClaimed: false,
        milestoneRewardId: reward._id,
    });

    if (!claims.length) {
        return res.status(403).json({ message: 'You have no claims' });
    }

    const promises = claims.map(async (claim) => {
        await PointBalanceService.add(pool, claim.sub, `${claim.amount}`);
        claim.isClaimed = true;
        await claim.save();
    });

    await Promise.all(promises);

    res.status(201).json(claims);
};

export default { controller };
