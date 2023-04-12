import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MilestoneRewardClaimService from '@thxnetwork/api/services/MilestoneRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { NotFoundError, UnauthorizedError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [body('address').exists(), param('token').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const wallet = await WalletService.findOneByAddress(req.body.address);
    const account = wallet ? await AccountProxy.getById(wallet.sub) : await AccountProxy.getByAddress(req.body.address);

    const reward = await MilestoneReward.findOne({ uuid: req.params.token });
    if (!reward) throw new NotFoundError('Could not find milestone reward for this token');
    if (reward.limit) {
        const numOfClaims = await MilestoneRewardClaim.count({ milestoneRewardId: reward.id, sub: account.sub });
        if (numOfClaims >= reward.limit) {
            throw new UnauthorizedError("This reward has reached it's limit.");
        }
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
