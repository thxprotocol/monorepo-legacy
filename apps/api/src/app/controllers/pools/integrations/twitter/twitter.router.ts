import express from 'express';
import CreateController from './post.controller';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
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

export default router;
