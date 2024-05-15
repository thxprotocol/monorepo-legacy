import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express, { Router } from 'express';
import * as ListRewards from './list.controller';
import * as CreateRewardPayment from './payments/post.controller';
import * as ListRewardPayment from './payments/list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', ListRewards.controller);
router.use(checkJwt, corsHandler);
router.post(
    '/:variant/:rewardId/payments',
    assertRequestInput(CreateRewardPayment.validation),
    CreateRewardPayment.controller,
);
router.get('/payments', assertRequestInput(ListRewardPayment.validation), ListRewardPayment.controller);

export default router;
