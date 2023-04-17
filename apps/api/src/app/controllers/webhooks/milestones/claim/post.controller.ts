import MilestoneRewardClaimService from '@thxnetwork/api/services/MilestoneRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
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

    if (reward.limit) {
        const claimsForAccount = await MilestoneRewardClaim.count({ milestoneRewardId: reward.id, sub: wallet.sub });
        if (claimsForAccount >= reward.limit)
            throw new ForbiddenError('This reward has reached its limit for this account.');
    }

    const claim = await MilestoneRewardClaimService.create({
        milestoneRewardId: String(reward._id),
        sub: wallet.sub,
        amount: String(reward.amount),
        poolId: reward.poolId,
    });

    res.status(201).json(claim);
};

export default { validation, controller };
