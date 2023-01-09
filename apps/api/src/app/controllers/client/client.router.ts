import express from 'express';
import ListController from './list.controller';
import GetController from './get.controller';
import PostController from './post.controller';
import PatchController from './patch.controller';
import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.get('/', guard.check(['clients:read']), assertAssetPoolOwnership, ListController.controller);
router.get('/:id', guard.check(['clients:read']), assertAssetPoolOwnership, GetController.controller);
router.patch(
    '/:id',
    guard.check(['clients:read', 'clients:write']),
    assertRequestInput(PatchController.validation),
    assertAssetPoolOwnership,
    PatchController.controller,
);
router.post('/', guard.check(['clients:read', 'clients:write']), assertAssetPoolOwnership, PostController.controller);

export default router;
