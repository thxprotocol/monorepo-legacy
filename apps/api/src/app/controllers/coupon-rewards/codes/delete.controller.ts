import { Request, Response } from 'express';
import { param } from 'express-validator';
import { CouponCode } from '@thxnetwork/api/models/CouponCode';
import { RewardCouponPayment } from '@thxnetwork/api/models/RewardCouponPayment';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { RewardCoupon } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId(), param('couponCodeId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const reward = await RewardCoupon.findById(req.params.id);
    if (reward.poolId !== poolId) throw new ForbiddenError('Not your reward');

    const payment = await RewardCouponPayment.exists({ couponCodeId: req.params.couponCodeId });
    if (payment) throw new ForbiddenError('Coupon code has been redeemed');

    await CouponCode.findByIdAndDelete(req.params.couponCodeId);

    res.status(204).end();
};

export default { controller, validation };
