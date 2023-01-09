import { Request, Response } from 'express';
import { canClaim } from '@thxnetwork/api/util/condition';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { Claim } from '@thxnetwork/api/models/Claim';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import db from '@thxnetwork/api/util/database';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await PointReward.findOne({ uuid: req.params.uuid });
    const account = await AccountProxy.getById(req.auth.sub);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const { result, error } = await canClaim(reward, account);
    if (!result || error) return res.json({ error });

    const claim = await Claim.create({
        rewardUuid: reward.uuid,
        poolId: pool._id,
        sub: req.auth.sub,
        amount: reward.amount,
        uuid: db.createUUID(),
    });

    await PointBalanceService.add(pool, req.auth.sub, reward.amount);

    res.status(201).json(claim);
};

export default { controller };
