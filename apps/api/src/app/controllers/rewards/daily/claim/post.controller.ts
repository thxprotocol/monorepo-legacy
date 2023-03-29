import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import DailyRewardClaimService from '@thxnetwork/api/services/DailyRewardClaimService';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('uuid').exists(), body('sub').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Reward Claims']
    const reward = await DailyRewardService.findByUUID(req.params.uuid);
    if (!reward) {
        throw new NotFoundError('Could not find the Daily Reward');
    }

    if (await DailyRewardClaimService.isClaimed(reward.poolId, req.body.sub)) {
        return res.json({ error: 'This reward is not claimable yet' });
    }

    const pool = await PoolService.getById(reward.poolId);
    await PointBalanceService.add(pool, req.body.sub, reward.amount);

    const claim = await DailyRewardClaimService.create({
        sub: req.body.sub,
        dailyRewardId: reward._id,
        poolId: reward.poolId,
        amount: reward.amount.toString(),
    });

    return res.status(201).json(claim);
};

export default { controller, validation };
