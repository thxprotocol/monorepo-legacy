import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateController from './post.controller';
import ReadController from './get.controller';
import ListController from './list.controller';

const router = express.Router({ mergeParams: true });

router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);
router.get('/:id', guard.check(['erc20:read']), ReadController.controller);
router.get('/', guard.check(['erc20:read']), assertRequestInput(ListController.validation), ListController.controller);

export default router;
