import express from 'express';
import { assertWallet, assertRequestInput } from '@thxnetwork/api/middlewares';
import * as CreateLiquidity from './post.controller';
import * as CreateLiquidityStaked from './stake/post.controller';

const router: express.Router = express.Router();

router.use('/', assertWallet);
router.post('/', assertRequestInput(CreateLiquidity.validation), CreateLiquidity.controller);
router.post('/stake', assertRequestInput(CreateLiquidityStaked.validation), CreateLiquidityStaked.controller);

export default router;
