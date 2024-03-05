import { Request, Response } from 'express';
import { query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { RewardVariant } from '@thxnetwork/common/enums';
import RewardService from '@thxnetwork/api/services/RewardService';
import { ForbiddenError } from '@thxnetwork/api/util/errors';

const validation = [query('couponRewardId').isMongoId(), query('page').isInt(), query('limit').isInt()];

const controller = async (req: Request, res: Response) => {
    const couponRewardId = req.query.couponRewardId as string;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    // Check if user is allowed to access the pool for this couponRewardId
    const reward = await RewardService.findById(RewardVariant.Coupon, couponRewardId);
    const isAllowed = await PoolService.isSubjectAllowed(req.auth.sub, reward.poolId);
    if (!isAllowed) throw new ForbiddenError('Not allowed to access these coupon codes');

    const result = await PoolService.findCouponCodes({ couponRewardId }, page, limit);

    res.json(result);
};

export default { controller, validation };
