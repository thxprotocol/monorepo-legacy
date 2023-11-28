import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import CreateVEApprove from './approve/post.controller';
import CreateVEDeposit from './deposit/post.controller';

const router = express.Router();

router.post('/approve', assertRequestInput(CreateVEApprove.validation), CreateVEApprove.controller);
router.post('/deposit', assertRequestInput(CreateVEDeposit.validation), CreateVEDeposit.controller);

export default router;
