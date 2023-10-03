import { Request, Response } from 'express';
import { param } from 'express-validator';
import DailyRewardClaimService, { ONE_DAY_MS } from '@thxnetwork/api/services/DailyRewardClaimService';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { DailyReward } from '@thxnetwork/api/services/DailyRewardService';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Reward Claims']
    const reward = await DailyReward.findById(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the Daily Reward');

    const pool = await PoolService.getById(reward.poolId);
    if (!pool) throw new NotFoundError('Could not find the campaign for this reward');

    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    const isClaimable = await DailyRewardClaimService.isClaimable(reward, wallet);
    if (!isClaimable) throw new ForbiddenError('This reward is not claimable yet');

    const claims = await DailyRewardClaim.find({
        dailyRewardId: reward._id,
        walletId: wallet._id,
        state: DailyRewardClaimState.Claimed,
    });

    let claim;
    if (reward.isEnabledWebhookQualification) {
        claim = await DailyRewardClaim.findOneAndUpdate(
            {
                dailyRewardId: String(reward._id),
                sub: req.auth.sub,
                walletId: wallet._id,
                state: DailyRewardClaimState.Pending,
                createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
            },
            { state: DailyRewardClaimState.Claimed },
            { new: true },
        );
    } else {
        claim = await DailyRewardClaimService.create({
            sub: req.auth.sub,
            walletId: wallet._id,
            dailyRewardId: reward._id,
            poolId: reward.poolId,
            amount: reward.amounts[claims.length],
            state: DailyRewardClaimState.Claimed,
        });
    }

    await PointBalanceService.add(pool, wallet._id, reward.amounts[0]);

    return res.status(201).json(claim);
};

export default { controller, validation };
