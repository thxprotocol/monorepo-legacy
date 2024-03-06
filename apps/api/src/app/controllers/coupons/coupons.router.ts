import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListCouponCode from './list.controller';
import RemoveCouponCode from './delete.controller';

const router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['coupon_rewards:read']),
    assertRequestInput(ListCouponCode.validation),
    ListCouponCode.controller,
);

router.delete(
    '/:couponCodeId/',
    guard.check(['coupon_rewards:write']),
    assertRequestInput(RemoveCouponCode.validation),
    RemoveCouponCode.controller,
);

export default router;
