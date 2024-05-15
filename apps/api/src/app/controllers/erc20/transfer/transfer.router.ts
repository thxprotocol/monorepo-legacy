import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as CreateController from './post.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);

export default router;
