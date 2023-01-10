import { Request, Response } from 'express';
import { canClaim } from '@thxnetwork/api/util/condition';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { Claim } from '@thxnetwork/api/models/Claim';
import MilestoneBalanceService from '@thxnetwork/api/services/MilestoneBalanceService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import db from '@thxnetwork/api/util/database';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await PointReward.findOne({ uuid: req.params.uuid });
    const account = await AccountProxy.getById(req.auth.sub);

    const { result, error } = await canClaim(reward, account);
    if (!result || error) return res.json({ error });

    const claim = await Claim.create({
        rewardUuid: reward.uuid,
        poolId: req.assetPool._id,
        sub: req.auth.sub,
        amount: reward.amount,
        uuid: db.createUUID(),
    });

    await MilestoneBalanceService.add(req.assetPool, req.auth.sub, reward.amount);

    res.status(201).json(claim);
};

export default { controller };
