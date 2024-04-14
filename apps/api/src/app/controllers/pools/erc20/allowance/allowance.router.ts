import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import ListController from './get.controller';
import CreateController from './post.controller';

const router = express.Router({ mergeParams: true });

router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);
router.get('/', assertRequestInput(ListController.validation), ListController.controller);

export default router;
