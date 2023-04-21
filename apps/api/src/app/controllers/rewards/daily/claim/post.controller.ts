import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import DailyRewardClaimService from '@thxnetwork/api/services/DailyRewardClaimService';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { DailyRewardClaim, DailyRewardClaimDocument } from '@thxnetwork/api/models/DailyRewardClaims';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';

const validation = [param('uuid').exists(), body('sub').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Reward Claims']
    const reward = await DailyRewardService.findByUUID(req.params.uuid);
    if (!reward) {
        throw new NotFoundError('Could not find the Daily Reward');
    }
    let isClaimableByWebHook = false;
    let isClaimableByUser = false;
    let errorMessage = 'This reward is not claimable';

    let claim: DailyRewardClaimDocument;

    if (reward.isEnabledWebhookQualification) {
        claim = await DailyRewardClaim.findOne({ dailyRewardId: reward._id, sub: req.auth.sub });
        if (claim && claim.state == DailyRewardClaimState.Pending) {
            isClaimableByWebHook = true;
        }
    }
    if (!isClaimableByWebHook) {
        isClaimableByUser = !(await DailyRewardClaimService.isClaimed(reward, req.body.sub));
        errorMessage = 'This reward is not claimable yet';
    }
    if (!isClaimableByWebHook && !isClaimableByUser) {
        errorMessage;
        return res.json({ error: errorMessage });
    }

    const pool = await PoolService.getById(reward.poolId);
    await PointBalanceService.add(pool, req.body.sub, reward.amount);

    if (claim) {
        claim.state = DailyRewardClaimState.Claimed;
        claim = await claim.save();
    } else {
        claim = await DailyRewardClaimService.create({
            sub: req.body.sub,
            dailyRewardId: reward._id,
            poolId: reward.poolId,
            amount: reward.amount.toString(),
            state: DailyRewardClaimState.Claimed,
        });
    }

    return res.status(201).json(claim);
};

export default { controller, validation };
