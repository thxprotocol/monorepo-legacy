import express from 'express';
import { assertPlan, assertRequestInput, assertAssetPoolAccess, requireAssetPoolHeader, guard } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateMember from './post.controller';
import ReadMember from './get.controller';
import UpdateMember from './patch.controller';
import DeleteMember from './delete.controller';
import ListMembers from './list.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['members:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListMembers.controller,
);
router.post(
    '/',
    guard.check(['members:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateMember.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateMember.controller,
);
router.patch(
    '/:address',
    guard.check(['members:read', 'members:write']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateMember.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateMember.controller,
);
router.delete(
    '/:address',
    guard.check(['members:write']),
    assertAssetPoolAccess,
    assertRequestInput(DeleteMember.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    DeleteMember.controller,
);
router.get(
    '/:address',
    guard.check(['members:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadMember.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadMember.controller,
);

export default router;
