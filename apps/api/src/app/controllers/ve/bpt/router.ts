import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import RouterBPTBalance from './balance/router';
import CreateController from './post.controller';

const router = express.Router();
router.use('/balance', RouterBPTBalance);
router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);

export default router;
