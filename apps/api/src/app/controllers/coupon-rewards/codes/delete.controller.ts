import { Request, Response } from 'express';
import { param } from 'express-validator';
import { CouponCode } from '@thxnetwork/api/models/CouponCode';
import { CouponRewardPayment } from '@thxnetwork/api/models/CouponRewardPayment';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';

const validation = [param('id').isMongoId(), param('couponCodeId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const reward = await CouponReward.findById(req.params.id);
    if (reward.poolId !== poolId) throw new ForbiddenError('Not your reward');

    const payment = await CouponRewardPayment.exists({ couponCodeId: req.params.couponCodeId });
    if (payment) throw new ForbiddenError('Coupon code has been redeemed');

    await CouponCode.findByIdAndDelete(req.params.couponCodeId);

    res.status(204).end();
};

export default { controller, validation };
