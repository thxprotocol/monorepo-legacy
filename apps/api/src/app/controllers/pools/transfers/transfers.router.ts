import express from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ListController from './list.controller';
import CreateController from './post.controller';
import ReadController from './get.controller';
import DeleteController from './delete.controller';
import routerTransferRefresh from './refresh/refresh.router';

const router = express.Router();

router.get(
    '/',
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListController.validation),
    ListController.controller,
);
router.get('/:token', assertRequestInput(ReadController.validation), ReadController.controller);
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

router.use('/refresh', routerTransferRefresh);

export default router;
