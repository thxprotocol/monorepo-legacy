import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import CreateController from './post.controller';

const router = express.Router({ mergeParams: true });

router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);

export default router;
