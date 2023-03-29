import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { getPlatformUserId, validateCondition } from '@thxnetwork/api/util/condition';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await PointReward.findOne({ uuid: req.params.uuid });
    const account = await AccountProxy.getById(req.auth.sub);
    const pool = await PoolService.getById(req.header('X-PoolId'));

    // We validate for both here since there are claims that only contain a sub and should not be claimed again
    const platformUserId = await getPlatformUserId(account, reward);
    let ids: any[] = [{ sub: req.auth.sub }];
    if (platformUserId) ids = [...ids, { platformUserId }];

    if (
        await PointRewardClaim.exists({
            pointRewardId: reward._id,
            $or: ids,
        })
    ) {
        return res.json({ error: 'You have claimed this reward already.' });
    }

    const failReason = await validateCondition(account, reward);
    if (failReason) return res.json({ error: failReason });

    const claim = await PointRewardClaim.create({
        pointRewardId: reward._id,
        poolId: pool._id,
        sub: req.auth.sub,
        platformUserId,
        amount: reward.amount,
    });

    await PointBalanceService.add(pool, req.auth.sub, reward.amount);

    res.status(201).json(claim);
};

export default { controller };
