import express from 'express';
import ListController from './list.controller';
import PostController from './post.controller';
import PatchController from './patch.controller';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.get('/', guard.check(['clients:read']), assertPoolAccess, ListController.controller);
router.patch(
    '/:id',
    guard.check(['clients:read', 'clients:write']),
    assertRequestInput(PatchController.validation),
    assertPoolAccess,
    PatchController.controller,
);
router.post('/', guard.check(['clients:read', 'clients:write']), assertPoolAccess, PostController.controller);

export default router;
