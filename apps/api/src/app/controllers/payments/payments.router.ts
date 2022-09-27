import express from 'express';

import { assertRequestInput, assertAssetPoolAccess, requireAssetPoolHeader, guard, checkJwt } from '@thxnetwork/api/middlewares';
import PostPayment from './post.controller';
import PostPaymentPay from './pay/post.controller';
import ReadPayment from './get.controller';
import ListPayment from './list.controller';

const router = express.Router();

// These 2 routes are public and authentication is handled with payment.token
router.get('/:id', assertRequestInput(ReadPayment.validation), ReadPayment.controller);

router.use(checkJwt);
router.post(
    '/:id/pay',
    assertRequestInput(PostPaymentPay.validation),
    requireAssetPoolHeader,
    PostPaymentPay.controller,
);
router.post(
    '/',
    guard.check(['payments:write']),
    assertAssetPoolAccess,
    assertRequestInput(PostPayment.validation),
    requireAssetPoolHeader,
    PostPayment.controller,
);
router.get('/', guard.check(['payments:read']), assertAssetPoolAccess, requireAssetPoolHeader, ListPayment.controller);

export default router;
