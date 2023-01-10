import { body } from 'express-validator';
import { Request, Response } from 'express';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import MailService from '@thxnetwork/api/services/MailService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [body('code').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const reward = await ReferralReward.findOne({ token: req.params.token });
    if (!reward) throw new NotFoundError('Could not find the reward');
    const claim = await ReferralRewardClaimService.create({ referralRewardId: String(reward._id), sub: req.body.code });
    const account = await AccountProxy.getById(req.body.code);

    // TODO Mark as approved and transfer points right away?
    await MailService.send(
        account.email,
        'Update on your referral',
        `Congratulations! Your referral has been approved and your balance has been increased with ${reward.amount} points.`,
    );

    res.status(201).json(claim);
};

export default { controller, validation };
