import { Request, Response } from 'express';
import { param } from 'express-validator';
import { CouponCode } from '@thxnetwork/api/models/CouponCode';
import { RewardCouponPayment } from '@thxnetwork/api/models/RewardCouponPayment';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { RewardVariant } from '@thxnetwork/common/enums';
import PoolService from '@thxnetwork/api/services/PoolService';
import RewardService from '@thxnetwork/api/services/RewardService';

const validation = [param('couponCodeId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const couponCode = await CouponCode.findById(req.params.couponCodeId);
    if (!couponCode) throw new NotFoundError('Coupon code not found');

    // Check if user is allowed to access the pool for this couponRewardId
    const reward = await RewardService.findById(RewardVariant.Coupon, couponCode.couponRewardId);
    const isAllowed = await PoolService.isSubjectAllowed(req.auth.sub, reward.poolId);
    if (!isAllowed) throw new ForbiddenError('Not allowed to access these coupon codes');

    // Check if the coupon code has already been purchased
    const payment = await RewardCouponPayment.exists({ couponCodeId: req.params.couponCodeId });
    if (payment) throw new ForbiddenError('Coupon code has been redeemed');

    await CouponCode.findByIdAndDelete(req.params.couponCodeId);

    res.status(204).end();
};

export default { controller, validation };
