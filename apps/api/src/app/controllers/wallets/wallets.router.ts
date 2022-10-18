import express from 'express';
import { assertPlan, assertAssetPoolAccess, requireAssetPoolHeader, guard } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateWallet from './post.controller';
import ListWallets from './list.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['wallets:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListWallets.controller,
);
router.post(
    '/',
    guard.check(['wallets:write']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateWallet.controller,
);

export default router;
