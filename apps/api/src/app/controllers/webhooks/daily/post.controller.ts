import DailyRewardClaimService from '@thxnetwork/api/services/DailyRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';

const validation = [body('address').exists(), param('token').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await DailyReward.findOne({ uuid: req.params.token });
    if (!reward) throw new NotFoundError('Could not find a daily reward for this token');

    const wallet = await WalletService.findOneByAddress(req.body.address);
    if (!wallet) throw new NotFoundError('Could not find a wallet for this address');

    const claim = await DailyRewardClaimService.create({
        dailyRewardId: String(reward._id),
        sub: wallet.sub,
        amount: String(reward.amount),
        poolId: reward.poolId,
        state: DailyRewardClaimState.Pending,
    });

    res.status(201).json(claim);
};

export default { validation, controller };
