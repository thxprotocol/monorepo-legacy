import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import * as CreateController from './post.controller';
import * as UpdateController from './patch.controller';
import * as RemoveController from './delete.controller';
import * as ListController from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListController.validation),
    ListController.controller,
);
router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.patch(
    '/:guildId',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:guildId',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(RemoveController.validation),
    RemoveController.controller,
);

export default router;
