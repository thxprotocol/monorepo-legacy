import express from 'express';
import * as CreateController from './queries/post.controller';
import * as UpdateController from './queries/patch.controller';
import * as DeleteController from './queries/delete.controller';
import * as ListController from './queries/list.controller';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/queries',
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListController.validation),
    ListController.controller,
);
router.post(
    '/queries',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.patch(
    '/queries/queryId',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/queries/:queryId',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);

export default router;
