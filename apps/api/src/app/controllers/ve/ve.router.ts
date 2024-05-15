import express, { Router } from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import { assertWallet } from '@thxnetwork/api/middlewares/assertWallet';

import * as ListController from './list.controller';
import * as CreateVEDeposit from './deposit/post.controller';
import * as CreateVEIncrease from './increase/post.controller';
import * as CreateVEClaim from './claim/post.controller';
import * as CreateVEWithdraw from './withdraw/post.controller';

const router: express.Router = express.Router();

router.use('/', assertWallet);
router.get('/', assertRequestInput(ListController.validation), ListController.controller);
router.post('/deposit', assertRequestInput(CreateVEDeposit.validation), CreateVEDeposit.controller);
router.post('/increase', assertRequestInput(CreateVEIncrease.validation), CreateVEIncrease.controller);
router.post('/claim', assertRequestInput(CreateVEClaim.validation), CreateVEClaim.controller);
router.post('/withdraw', assertRequestInput(CreateVEWithdraw.validation), CreateVEWithdraw.controller);

export default router;
