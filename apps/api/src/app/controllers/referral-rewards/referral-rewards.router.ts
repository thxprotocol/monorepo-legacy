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
import CreateReferralRewardClaim from './claims/post.controller';
import ReadReferralReward from './get.controller';
import ReadReferralRewardClaim from './claims/get.controller';
import UpdateReferralReward from './patch.controller';
import ListReferralReward from './list.controller';
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
    '/:id/claims',
    guard.check(['referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadReferralRewardClaim.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadReferralRewardClaim.controller,
);
router.post(
    '/:id/claims',
    guard.check(['referral_rewards:read', 'referal_reward_claims:read', 'referal_reward_claims:write']),
    assertAssetPoolAccess,
    assertRequestInput(CreateReferralRewardClaim.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateReferralRewardClaim.controller,
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
router.patch(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateReferralReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateReferralReward.controller,
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
