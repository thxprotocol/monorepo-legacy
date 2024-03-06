import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';
import CreateRewardPayment from './payments/post.controller';
import ListRewardPayment from './payments/list.controller';

const router = express.Router({ mergeParams: true });

router.get('/', ListRewards.controller);
router.use(checkJwt, corsHandler);
router.post(
    '/:variant/:rewardId/payments',
    assertRequestInput(CreateRewardPayment.validation),
    CreateRewardPayment.controller,
);
router.get('/payments', assertRequestInput(ListRewardPayment.validation), ListRewardPayment.controller);

export default router;
