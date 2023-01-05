import express from 'express';
import {
    assertAssetPoolAccess,
    assertRequestInput,
    requireAssetPoolHeader,
    guard,
    assertPlan,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateReferralReward from './post.controller';
import ReadReferralReward from './get.controller';
import UpdateReferralReward from './patch.controller';
import ListReferralReward from './list.controller';
import ListReferralRewardClaims from './claims/list.controller';
import CreateReferralRewardClaim from './claims/post.controller';
import UpdateReferralRewardClaim from './claims/patch.controller';
import DeleteReferralReward from './delete.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['referral_rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(ListReferralReward.validation),
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListReferralReward.controller,
);
router.get(
    '/:id',
    guard.check(['referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadReferralReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadReferralReward.controller,
);
router.get(
    '/:uuid/claims',
    guard.check(['referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(ListReferralRewardClaims.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListReferralRewardClaims.controller,
);
router.post(
    '/',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateReferralReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateReferralReward.controller,
);
router.post(
    '/:uuid/claims',
    guard.check(['referral_rewards:read', 'referral_rewards:write']),
    assertAssetPoolAccess,
    assertRequestInput(CreateReferralRewardClaim.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateReferralRewardClaim.controller,
);
router.patch(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateReferralReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateReferralReward.controller,
);
router.patch(
    '/:uuid/claims/:id',
    guard.check(['referral_rewards:read', 'referral_rewards:write']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateReferralRewardClaim.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateReferralRewardClaim.controller,
);
router.delete(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(DeleteReferralReward.validation),
    DeleteReferralReward.controller,
);
export default router;
