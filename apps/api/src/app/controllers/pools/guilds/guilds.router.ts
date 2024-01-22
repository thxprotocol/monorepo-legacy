import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import CreateController from './post.controller';
import UpdateController from './patch.controller';
import RemoveController from './delete.controller';
import ListController from './list.controller';

const router = express.Router({ mergeParams: true });

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
