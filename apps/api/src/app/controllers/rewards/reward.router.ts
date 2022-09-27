import express from 'express';
import { assertAssetPoolAccess, assertRequestInput, requireAssetPoolHeader, guard, assertPlan } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateReward from './post.controller';
import ReadReward from './get.controller';
import UpdateReward from './patch.controller';
import ListRewards from './list.controller';
import CreateRewardGive from './give/post.controller';
import ListClaimsQRCode from './claims/qrcode/get.controller';
import { rateLimitRewardGive } from '@thxnetwork/api/util/ratelimiter';

const router = express.Router();

router.get(
    '/',
    guard.check(['rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListRewards.controller,
);
router.get(
    '/:id',
    guard.check(['rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadReward.controller,
);
router.get(
    '/:id/claims/qrcode',
    guard.check(['rewards:read', 'claims:read']),
    assertAssetPoolAccess,
    assertRequestInput(ListClaimsQRCode.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListClaimsQRCode.controller,
);
router.post(
    '/',
    guard.check(['rewards:write', 'rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateReward.controller,
);
router.patch(
    '/:id',
    guard.check(['rewards:write', 'rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateReward.controller,
);
router.post(
    '/:id/give',
    guard.check(['withdrawals:write', 'rewards:read']),
    rateLimitRewardGive,
    assertRequestInput(CreateRewardGive.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateRewardGive.controller,
);

export default router;
