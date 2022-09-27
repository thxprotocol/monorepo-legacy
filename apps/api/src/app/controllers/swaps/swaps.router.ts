import express from 'express';
import CreateERC20Swap from './post.controller';
import ReadERC20Swap from './get.controller';
import ListERC20Swaps from './list.controller';
import { assertRequestInput, assertAssetPoolAccess, requireAssetPoolHeader, assertPlan, guard } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';

const router = express.Router();

router.get(
    '/',
    guard.check(['swap:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListERC20Swaps.controller,
);
router.get(
    '/:id',
    guard.check(['swap:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadERC20Swap.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadERC20Swap.controller,
);
router.post(
    '/',
    guard.check(['swap:write', 'swap:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateERC20Swap.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateERC20Swap.controller,
);

export default router;
