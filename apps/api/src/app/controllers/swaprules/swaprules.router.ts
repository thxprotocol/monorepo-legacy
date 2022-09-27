import express from 'express';
import CreateERC20SwapRule from './post.controller';
import ReadERC20SwapRule from './get.controller';
import ListERC20SwapRules from './list.controller';
import { assertRequestInput, assertAssetPoolAccess, requireAssetPoolHeader, assertPlan, guard } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';

const router = express.Router();

router.get(
    '/',
    guard.check(['swaprule:read']),
    assertAssetPoolAccess,
    assertRequestInput(ListERC20SwapRules.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListERC20SwapRules.controller,
);
router.get(
    '/:id',
    guard.check(['swaprule:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadERC20SwapRule.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadERC20SwapRule.controller,
);
router.post(
    '/',
    guard.check(['swaprule:write', 'swaprule:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(CreateERC20SwapRule.validation),
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateERC20SwapRule.controller,
);

export default router;
