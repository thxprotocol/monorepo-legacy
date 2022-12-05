import { Request, Response } from 'express';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await ReferralReward.findOne({ uuid: req.params.uuid });
    if (!reward) throw new NotFoundError('No reward for that uuid could be found.');

    const account = await AccountProxy.getById(req.body.sub);
    if (!account) throw new NotFoundError('No account for that sub could be found.');

    const claim = await ReferralRewardClaim.create({
        referralRewardId: String(reward._id),
        poolId: req.assetPool._id,
        sub: req.body.sub,
    });

    await PointBalanceService.add(req.assetPool, req.auth.sub, reward.amount);

    res.json(claim);
};

export default { controller };
