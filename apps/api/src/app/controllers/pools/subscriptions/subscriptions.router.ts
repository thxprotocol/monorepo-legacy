import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateController from './post.controller';
import ListController from './list.controller';
import DeleteController from './delete.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['pool_subscription:read']),
    assertRequestInput(ListController.validation),
    ListController.controller,
);
router.post(
    '/',
    guard.check(['pool_subscription:write']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.delete(
    '/',
    guard.check(['pool_subscription:write']),
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);

export default router;
