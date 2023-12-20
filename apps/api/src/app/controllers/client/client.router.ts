import express from 'express';
import ListController from './list.controller';
import PostController from './post.controller';
import PatchController from './patch.controller';
import { assertPoolAccess, assertPlan, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/types/enums';

const router = express.Router();

router.get(
    '/',
    guard.check(['clients:read']),
    assertPoolAccess,
    assertPlan([AccountPlanType.Premium]),
    ListController.controller,
);
router.patch(
    '/:id',
    guard.check(['clients:read', 'clients:write']),
    assertRequestInput(PatchController.validation),
    assertPoolAccess,
    assertPlan([AccountPlanType.Premium]),
    PatchController.controller,
);
router.post(
    '/',
    guard.check(['clients:read', 'clients:write']),
    assertPoolAccess,
    assertPlan([AccountPlanType.Premium]),
    PostController.controller,
);

export default router;
