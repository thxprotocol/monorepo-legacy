import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import * as CreateController from './post.controller';
import * as UpdateController from './patch.controller';
import * as RemoveController from './delete.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.patch(
    '/:uuid',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:uuid',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(RemoveController.validation),
    RemoveController.controller,
);

export default router;
