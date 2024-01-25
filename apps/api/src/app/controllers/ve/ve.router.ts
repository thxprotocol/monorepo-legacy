import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

import ListController from './list.controller';
import ListPrice from './price/list.controller';

import CreateVEApprove from './approve/post.controller';
import CreateVEDeposit from './deposit/post.controller';
import CreateVEWithdraw from './withdraw/post.controller';

const router = express.Router();

router.get('/', assertRequestInput(ListController.validation), ListController.controller);
router.get('/price', ListPrice.controller);
router.post('/approve', assertRequestInput(CreateVEApprove.validation), CreateVEApprove.controller);
router.post('/deposit', assertRequestInput(CreateVEDeposit.validation), CreateVEDeposit.controller);
router.post('/withdraw', assertRequestInput(CreateVEWithdraw.validation), CreateVEWithdraw.controller);

export default router;
