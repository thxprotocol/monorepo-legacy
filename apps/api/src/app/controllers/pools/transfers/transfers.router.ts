import express from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ListController from './list.controller';
import CreateController from './post.controller';
import ReadController from './get.controller';
import DeleteController from './delete.controller';
import RouterTransferRefresh from './refresh/refresh.router';

const router = express.Router({ mergeParams: true });

// No scopes checks as this should be publically accessible if the :token param is known
router.get('/:token', assertRequestInput(ReadController.validation), ReadController.controller);

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
router.delete(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);

router.use('/refresh', RouterTransferRefresh);

export default router;
