import express from 'express';
import {
    assertAssetPoolAccess,
    assertRequestInput,
    requireAssetPoolHeader,
    guard,
    assertPlan,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateERC20Perk from './post.controller';
import ReadERC20Perk from './get.controller';
import UpdateERC20Perk from './patch.controller';
import ListERC20Perk from './list.controller';
import DeleteERC20Perk from './delete.controller';
import PurchaseERC20Perk from '../perks/erc20/purchase/post.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['erc20_rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListERC20Perk.controller,
);
router.get(
    '/:id',
    guard.check(['erc20_rewards:read']),
    //assertAssetPoolAccess,
    assertRequestInput(ReadERC20Perk.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadERC20Perk.controller,
);
router.post(
    '/',
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateERC20Perk.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateERC20Perk.controller,
);

router.post(
    '/:id/purchase',
    guard.check(['erc20_rewards:read', 'erc20:read', 'account:read']),
    assertAssetPoolAccess,
    assertRequestInput(PurchaseERC20Perk.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    PurchaseERC20Perk.controller,
);

router.patch(
    '/:id',
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateERC20Perk.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateERC20Perk.controller,
);

router.delete(
    '/:id',
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(DeleteERC20Perk.validation),
    DeleteERC20Perk.controller,
);

export default router;
