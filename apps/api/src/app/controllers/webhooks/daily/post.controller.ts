import DailyRewardClaimService, { ONE_DAY_MS } from '@thxnetwork/api/services/DailyRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';

const validation = [body('address').exists(), param('token').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await DailyReward.findOne({ uuid: req.params.token });
    if (!reward) throw new NotFoundError('Could not find a daily reward for this token');

    const wallet = await WalletService.findOneByAddress(req.body.address);
    if (!wallet) throw new NotFoundError('Could not find a wallet for this address');

    // Should only create one when there is none available within the timeframe
    let claim = await DailyRewardClaim.findOne({
        dailyRewardId: reward._id,
        walletId: wallet._id,
        createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
    });

    if (!claim) {
        claim = await DailyRewardClaimService.create({
            poolId: reward.poolId,
            dailyRewardId: String(reward._id),
            sub: wallet.sub,
            walletId: wallet._id,
            amount: reward.amount,
            state: DailyRewardClaimState.Pending,
        });
    }

    res.status(201).json(claim);
};

export default { validation, controller };
