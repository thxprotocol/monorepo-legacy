import express from 'express';
import ListController from './list.controller';
import GetController from './get.controller';
import PostController from './post.controller';
import PatchController from './patch.controller';
import { assertAssetPoolOwnership, assertPlan, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/types/enums';

const router = express.Router();

router.get(
    '/',
    guard.check(['clients:read']),
    assertAssetPoolOwnership,
    assertPlan([AccountPlanType.Premium]),
    ListController.controller,
);
router.get(
    '/:id',
    guard.check(['clients:read']),
    assertAssetPoolOwnership,
    assertPlan([AccountPlanType.Premium]),
    GetController.controller,
);
router.patch(
    '/:id',
    guard.check(['clients:read', 'clients:write']),
    assertRequestInput(PatchController.validation),
    assertAssetPoolOwnership,
    assertPlan([AccountPlanType.Premium]),
    PatchController.controller,
);
router.post(
    '/',
    guard.check(['clients:read', 'clients:write']),
    assertAssetPoolOwnership,
    assertPlan([AccountPlanType.Premium]),
    PostController.controller,
);

export default router;
