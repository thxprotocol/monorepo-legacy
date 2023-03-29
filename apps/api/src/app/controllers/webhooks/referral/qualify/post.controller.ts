import { body } from 'express-validator';
import { Request, Response } from 'express';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import MailService from '@thxnetwork/api/services/MailService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [body('code').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const reward = await ReferralReward.findOne({ token: req.params.token });
    if (!reward) throw new NotFoundError('Could not find the reward');

    const buffer = Buffer.from(req.body.code, 'base64').toString();
    const { sub } = JSON.parse(buffer);
    const claim = await ReferralRewardClaimService.create({
        referralRewardId: String(reward._id),
        sub,
        isApproved: true,
        poolId: reward.poolId,
        amount: reward.amount ? reward.amount.toString() : '0',
    });
    const account = await AccountProxy.getById(sub);
    const pool = await PoolService.getById(reward.poolId);

    await PointBalanceService.add(pool, claim.sub, reward.amount);

    await MailService.send(
        account.email,
        'Status: Referral Approved',
        `Congratulations! Your referral has been approved and your balance has been increased with <strong>${reward.amount} points</strong>.`,
    );

    res.status(201).json(claim);
};

export default { controller, validation };
