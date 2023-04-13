import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MilestoneRewardClaimService from '@thxnetwork/api/services/MilestoneRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [body('address').exists(), param('token').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await MilestoneReward.findOne({ uuid: req.params.token });
    if (!reward) throw new NotFoundError('Could not find a milestone reward for this token');

    const wallet = await WalletService.findOneByAddress(req.body.address);
    if (!wallet) throw new NotFoundError('Could not find a wallet for this address');

    const account = await AccountProxy.getById(wallet.sub);

    if (reward.limit) {
        const numOfClaims = await MilestoneRewardClaim.count({ milestoneRewardId: reward.id, sub: account.sub });
        if (numOfClaims >= reward.limit) throw new ForbiddenError("This reward has reached it's limit.");
    }

    const claim = await MilestoneRewardClaimService.create({
        milestoneRewardId: String(reward._id),
        sub: account.sub,
        amount: String(reward.amount),
        poolId: reward.poolId,
    });

    res.status(201).json(claim);
};

export default { validation, controller };
