import { Request, Response } from 'express';
import { param } from 'express-validator';
import DailyRewardClaimService, { ONE_DAY_MS } from '@thxnetwork/api/services/DailyRewardClaimService';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
import { Wallet } from '@thxnetwork/api/models/Wallet';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Reward Claims']
    const reward = await DailyRewardService.findByUUID(req.params.uuid);
    if (!reward) throw new NotFoundError('Could not find the Daily Reward');

    const pool = await PoolService.getById(reward.poolId);
    if (!pool) throw new NotFoundError('Could not find the campaign for this reward');

    const wallet = await Wallet.findOne({ sub: req.auth.sub, chainId: pool.chainId });
    const isClaimable = await DailyRewardClaimService.isClaimable(reward, wallet);
    if (!isClaimable) throw new ForbiddenError('This reward is not claimable yet');

    const claim = reward.isEnabledWebhookQualification
        ? await DailyRewardClaim.findOneAndUpdate(
              {
                  dailyRewardId: reward._id,
                  sub: req.auth.sub,
                  walletId: wallet._id,
                  state: DailyRewardClaimState.Pending,
                  createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
              },
              { state: DailyRewardClaimState.Claimed },
              { new: true },
          )
        : await DailyRewardClaimService.create({
              sub: req.auth.sub,
              walletId: wallet._id,
              dailyRewardId: reward._id,
              poolId: reward.poolId,
              amount: reward.amount,
              state: DailyRewardClaimState.Claimed,
          });

    await PointBalanceService.add(pool, wallet._id, reward.amount);

    return res.status(201).json(claim);
};

export default { controller, validation };
