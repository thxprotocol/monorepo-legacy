import { Request, Response } from 'express';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MailService from '@thxnetwork/api/services/MailService';

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
        amount: reward.amount,
    });

    await PointBalanceService.add(req.assetPool, req.body.sub, reward.amount);

    await MailService.send(
        account.email,
        'Update on your referral link.',
        `Congratulations! Your referral link has been used and ${reward.amount} points have been transferred to your wallet.`,
    );

    res.status(201).json(claim);
};

export default { controller };
