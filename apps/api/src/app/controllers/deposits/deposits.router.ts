import express from 'express';
import CreateDeposit from './post.controller';
import ReadDeposit from './get.controller';
import ListDeposits from './list.controller';
import CreateDepositApprove from './approve/post.controller';
import { assertRequestInput, assertAssetPoolAccess, requireAssetPoolHeader, guard, assertPlan } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';

const router = express.Router();

router.get(
    '/',
    guard.check(['deposits:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListDeposits.controller,
);
router.get(
    '/:id',
    guard.check(['deposits:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadDeposit.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadDeposit.controller,
);
router.post(
    '/',
    guard.check(['deposits:write', 'deposits:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(CreateDeposit.validation),
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateDeposit.controller,
);
router.post(
    '/approve',
    guard.check(['deposits:write']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(CreateDepositApprove.validation),
    CreateDepositApprove.controller,
);

export default router;
