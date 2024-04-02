import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

import ListController from './list.controller';
import CreateVEDeposit from './deposit/post.controller';
import CreateVEIncrease from './increase/post.controller';
import CreateVEClaim from './claim/post.controller';
import CreateVEWithdraw from './withdraw/post.controller';
import { assertWallet } from '@thxnetwork/api/middlewares/assertWallet';

const router = express.Router();

router.use('/', assertWallet);
router.get('/', assertRequestInput(ListController.validation), ListController.controller);
router.post('/deposit', assertRequestInput(CreateVEDeposit.validation), CreateVEDeposit.controller);
router.post('/increase', assertRequestInput(CreateVEIncrease.validation), CreateVEIncrease.controller);
router.post('/claim', assertRequestInput(CreateVEClaim.validation), CreateVEClaim.controller);
router.post('/withdraw', assertRequestInput(CreateVEWithdraw.validation), CreateVEWithdraw.controller);

export default router;
