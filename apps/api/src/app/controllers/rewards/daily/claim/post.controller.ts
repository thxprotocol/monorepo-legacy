import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import DailyRewardClaimService from '@thxnetwork/api/services/DailyRewardClaimService';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('uuid').exists(), body('sub').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Reward Claims']
    const oneday = 86400000; // 24 hours in milliseconds

    if (await DailyRewardClaim.exists({ sub: req.body.sub, createdAt: { $lt: new Date(Date.now() + oneday) } })) {
        return res.json({ error: 'This reward is not claimable yet' });
    }

    const reward = await DailyRewardService.findByUUID(req.params.uuid);
    if (!reward) {
        throw new NotFoundError('Could not find the Daily Reward');
    }

    const pool = await PoolService.getById(reward.poolId);
    await PointBalanceService.add(pool, req.body.sub, reward.amount);

    const claim = await DailyRewardClaimService.create({
        sub: req.body.sub,
        dailyRewardId: reward._id,
        poolId: reward.poolId,
    });
    return res.status(201).json(claim);
};

export default { controller, validation };
