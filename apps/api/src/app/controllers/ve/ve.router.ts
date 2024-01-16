import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

import RouterBPT from './bpt/router';
// import RouterApprove from './approve/router';

import ListVELocks from './list.controller';
import CreateVEApprove from './approve/post.controller';
import CreateVEDeposit from './deposit/post.controller';
import CreateVEWithdraw from './withdraw/post.controller';

const router = express.Router();

router.get('/', assertRequestInput(ListVELocks.validation), ListVELocks.controller);
// router.post('/bpt', assertRequestInput(CreateVEBPT.validation), CreateVEBPT.controller);
router.post('/approve', assertRequestInput(CreateVEApprove.validation), CreateVEApprove.controller);
router.post('/deposit', assertRequestInput(CreateVEDeposit.validation), CreateVEDeposit.controller);
router.post('/withdraw', assertRequestInput(CreateVEWithdraw.validation), CreateVEWithdraw.controller);

router.use('/bpt', RouterBPT);

export default router;
