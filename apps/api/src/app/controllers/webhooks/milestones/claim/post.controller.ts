import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import MilestoneRewardClaimService from '@thxnetwork/api/services/MilestoneRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [body('address').exists(), param('token').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']

    const wallet = await WalletService.findOneByAddress(req.body.address);
    if (!wallet) {
        throw new NotFoundError('Could not find the wallet address');
    }

    const reward = await MilestoneReward.findOne({ uuid: req.params.token });
    if (!reward) throw new NotFoundError('Could not find milestone reward for this token');

    const claim = await MilestoneRewardClaimService.create({
        milestoneRewardId: String(reward._id),
        sub: wallet.sub,
        amount: String(reward.amount),
    });

    res.status(201).json(claim);
};

export default { validation, controller };
