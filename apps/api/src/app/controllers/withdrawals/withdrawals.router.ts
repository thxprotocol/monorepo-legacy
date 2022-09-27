import express from 'express';
import { guard, assertPlan, assertAssetPoolAccess, assertRequestInput, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateWithdrawal from './post.controller';
import ReadWithdrawal from './get.controller';
import DeleteWithdrawal from './delete.controller';
import ListWithdrawal from './list.controller';

const router = express.Router();

router.post(
    '/',
    guard.check(['withdrawals:write', 'withdrawals:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateWithdrawal.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateWithdrawal.controller,
);
router.get(
    '/',
    guard.check(['withdrawals:read']),
    assertAssetPoolAccess,
    assertRequestInput(ListWithdrawal.validation),
    requireAssetPoolHeader,
    ListWithdrawal.controller,
);
router.get(
    '/:id',
    guard.check(['withdrawals:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadWithdrawal.validation),
    requireAssetPoolHeader,
    ReadWithdrawal.controller,
);
router.delete(
    '/:id',
    guard.check(['withdrawals:write']),
    assertAssetPoolAccess,
    assertRequestInput(DeleteWithdrawal.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    DeleteWithdrawal.controller,
);

export default router;
