import express from 'express';
import CreateController from './post.controller';
import ListController from './get.controller';
import DeleteController from './delete.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router = express.Router({ mergeParams: true });

router.get('/', guard.check(['pools:read']), assertRequestInput(ListController.validation), ListController.controller);
router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.delete(
    '/:identityId',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);

export default router;
