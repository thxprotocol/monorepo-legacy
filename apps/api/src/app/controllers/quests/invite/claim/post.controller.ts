import { Request, Response } from 'express';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MailService from '@thxnetwork/api/services/MailService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { v4 } from 'uuid';
import { body, param } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [param('uuid').exists().isString(), body('sub').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await ReferralReward.findOne({ uuid: req.params.uuid });
    if (!reward) throw new NotFoundError('No reward for that uuid could be found.');
    if (!reward.successUrl) throw new ForbiddenError('No claims through URL qualification allowed.');

    const account = await AccountProxy.getById(req.body.sub);
    if (!account) throw new NotFoundError('No account for that sub could be found.');

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const wallet = await WalletService.findPrimary(req.body.sub, pool.chainId);
    const claim = await ReferralRewardClaim.create({
        referralRewardId: reward._id,
        poolId: pool._id,
        walletId: wallet._id,
        sub: req.body.sub,
        amount: reward.amount,
        uuid: v4(),
    });

    await MailService.send(
        account.email,
        'Status: Referral Qualified',
        `Congratulations! Your referral link has been qualified and approval for a transfer of <strong>${reward.amount} points</strong> has been requested.`,
    );

    res.status(201).json(claim);
};

export default { controller, validation };
