import { Request, Response } from 'express';
import { WithdrawalState, WithdrawalType } from '@thxnetwork/api/types/enums';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import RewardService from '@thxnetwork/api/services/RewardService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import MemberService from '@thxnetwork/api/services/MemberService';
import { WithdrawalDocument } from '@thxnetwork/api/models/Withdrawal';
import { param, body } from 'express-validator';

const validation = [param('id').exists(), body('member').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await RewardService.get(req.assetPool, req.params.id);
    if (!reward) throw new BadRequestError('Could not find a reward for this id');

    const isMember = await MemberService.isMember(req.assetPool, req.body.member);
    if (!isMember && reward.isMembershipRequired) throw new ForbiddenError();

    const account = await AccountProxy.getByAddress(req.body.member);
    if (!account) throw new NotFoundError();

    let w: WithdrawalDocument = await WithdrawalService.schedule(
        req.assetPool,
        WithdrawalType.ClaimRewardFor,
        account.id,
        reward.withdrawAmount,
        // Accounts with stored (encrypted) privateKeys are custodial and should not be processed before
        // they have logged into their wallet to update their account with a new wallet address.
        account.privateKey ? WithdrawalState.Deferred : WithdrawalState.Pending,
        reward.withdrawUnlockDate,
        req.params.id,
    );

    w = await WithdrawalService.withdrawFor(req.assetPool, w, account);

    res.json({
        ...w.toJSON(),
        id: String(w._id),
        sub: account.id,
        poolAddress: req.assetPool.address,
    });
};

export default { controller, validation };
