import express from 'express';
import * as CreateController from './post.controller';
import * as ListController from './get.controller';
import * as DeleteController from './delete.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router({ mergeParams: true });

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
