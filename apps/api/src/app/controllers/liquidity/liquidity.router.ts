import express from 'express';
import { assertWallet, assertRequestInput } from '@thxnetwork/api/middlewares';
import CreateLiquidityController from './post.controller';
import CreateLiquidityStakedController from './stake/post.controller';

const router = express.Router();

router.use('/', assertWallet);
router.post('/', assertRequestInput(CreateLiquidityController.validation), CreateLiquidityController.controller);
router.post(
    '/stake',
    assertRequestInput(CreateLiquidityStakedController.validation),
    CreateLiquidityStakedController.controller,
);

export default router;
