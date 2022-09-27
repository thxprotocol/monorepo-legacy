import express from 'express';
import {
    assertRequestInput,
    assertPlan,
    assertPoolOwner,
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    guard,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreatePool from './post.controller';
import ReadPool from './get.controller';
import DeletePool from './delete.controller';
import ListPools from './list.controller';
import CreatePoolTopup from './topup/post.controller';
import UpdatePool from './patch.controller';

const router = express.Router();

router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(CreatePool.validation),
    CreatePool.controller,
);
router.get('/', guard.check(['pools:read']), assertRequestInput(ListPools.validation), ListPools.controller);
router.get(
    '/:id',
    guard.check(['pools:read']),
    assertRequestInput(ReadPool.validation),
    assertPoolOwner,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadPool.controller,
);
router.delete(
    '/:id',
    guard.check(['pools:write']),
    assertRequestInput(DeletePool.validation),
    assertPoolOwner,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    DeletePool.controller,
);
router.post(
    '/:id/topup',
    guard.check(['deposits:read', 'deposits:write']),
    assertAssetPoolAccess,
    assertRequestInput(CreatePoolTopup.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreatePoolTopup.controller,
);
router.patch(
    '/:id',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(UpdatePool.validation),
    UpdatePool.controller,
);
export default router;
