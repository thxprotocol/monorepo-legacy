import { AccountService } from '@thxnetwork/auth/services/AccountService';
import MilestoneRewardClaimService from '@thxnetwork/api/services/MilestoneRewardClaimService';
import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [body('address').exists(), param('uuid').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const { token } = req.params;
    const reward = await MilestoneRewardService.get(token);
    const account = await AccountService.getByAddress(req.body.address);

    if (!reward) throw new NotFoundError('Could not find the reward');
    const claim = await MilestoneRewardClaimService.create({
        milestoneRewardId: String(reward._id),
        sub: account.id,
        amount: String(reward.amount),
    });

    res.status(201).json(claim);
};

export default { validation, controller };
