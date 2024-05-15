import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import * as ListController from './get.controller';
import * as CreateController from './post.controller';

const router: express.Router = express.Router();

router.post(
    '/',
    guard.check(['erc20:read']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.get('/', guard.check(['erc20:read']), assertRequestInput(ListController.validation), ListController.controller);

export default router;
