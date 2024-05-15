import express from 'express';
import * as ListController from './list.controller';
import * as PostController from './post.controller';
import * as PatchController from './patch.controller';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router();

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
