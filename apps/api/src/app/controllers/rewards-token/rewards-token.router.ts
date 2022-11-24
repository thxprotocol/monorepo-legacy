import express from 'express';
import {
    assertAssetPoolAccess,
    assertRequestInput,
    requireAssetPoolHeader,
    guard,
    assertPlan,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateERC20Reward from './post.controller';
import ReadERC20Reward from './get.controller';
import UpdateERC20Reward from './patch.controller';
import ListERC20Reward from './list.controller';
import ClaimERC20Reward from './claims/qrcode/get.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['erc20_rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListERC20Reward.controller,
);
router.get(
    '/:id',
    guard.check(['erc20_rewards:read']),
    //assertAssetPoolAccess,
    assertRequestInput(ReadERC20Reward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadERC20Reward.controller,
);
router.post(
    '/',
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateERC20Reward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateERC20Reward.controller,
);

router.patch(
    '/:id',
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateERC20Reward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateERC20Reward.controller,
);

router.get(
    '/:id/claims/qrcode',
    guard.check(['erc20_rewards:read', 'erc20_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(ClaimERC20Reward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ClaimERC20Reward.controller,
);

export default router;
