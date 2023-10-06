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
import QuestService from '@thxnetwork/api/services/QuestService';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Reward Claims']
    const quest = await DailyReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Could not find the Daily Reward');

    const pool = await PoolService.getById(quest.poolId);
    if (!pool) throw new NotFoundError('Could not find the campaign for this reward');

    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    const isClaimable = await DailyRewardClaimService.isClaimable(quest, wallet);
    if (!isClaimable) throw new ForbiddenError('This reward is not claimable yet');

    const claims = await DailyRewardClaim.find({
        dailyRewardId: quest._id,
        walletId: wallet._id,
        state: DailyRewardClaimState.Claimed,
    });

    const amount = quest.amounts[claims.length];
    const account = await AccountProxy.getById(req.auth.sub);
    const entry = await QuestService.complete(QuestVariant.Daily, amount, pool, quest, account, wallet, {
        dailyRewardId: quest._id,
        state: DailyRewardClaimState.Claimed,
    });

    return res.status(201).json(entry);
};

export default { controller, validation };
