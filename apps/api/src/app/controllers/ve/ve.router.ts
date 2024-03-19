import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

import ListController from './list.controller';
import CreateVEClaim from './claim/post.controller';
import CreateVEDeposit from './deposit/post.controller';
import CreateVEWithdraw from './withdraw/post.controller';

const router = express.Router();

router.get('/', assertRequestInput(ListController.validation), ListController.controller);
router.post('/claim', assertRequestInput(CreateVEClaim.validation), CreateVEClaim.controller);
router.post('/deposit', assertRequestInput(CreateVEDeposit.validation), CreateVEDeposit.controller);
router.post('/withdraw', assertRequestInput(CreateVEWithdraw.validation), CreateVEWithdraw.controller);

export default router;
