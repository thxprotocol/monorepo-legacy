import express from 'express';
import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateReferralReward from './post.controller';
import ReadReferralReward from './get.controller';
import UpdateReferralReward from './patch.controller';
import ListReferralReward from './list.controller';
import ListReferralRewardClaims from './claims/list.controller';
import CreateReferralRewardClaim from './claims/post.controller';
import UpdateReferralRewardClaim from './claims/patch.controller';
import ApproveReferralRewardClaims from './claims/approve/patch.controller';
import DeleteReferralReward from './delete.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ListReferralReward.validation),
    ListReferralReward.controller,
);
router.get(
    '/:id',
    guard.check(['referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ReadReferralReward.validation),
    ReadReferralReward.controller,
);
router.get(
    '/:uuid/claims',
    guard.check(['referral_rewards:read']),
    assertRequestInput(ListReferralRewardClaims.validation),
    ListReferralRewardClaims.controller,
);
router.post(
    '/',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(CreateReferralReward.validation),
    CreateReferralReward.controller,
);
router.post(
    '/:uuid/claims',
    guard.check(['referral_rewards:read', 'referral_rewards:write']),
    assertRequestInput(CreateReferralRewardClaim.validation),
    CreateReferralRewardClaim.controller,
);
router.patch(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(UpdateReferralReward.validation),
    UpdateReferralReward.controller,
);
router.patch(
    '/:uuid/claims/:id',
    guard.check(['referral_rewards:read', 'referral_rewards:write']),
    assertRequestInput(UpdateReferralRewardClaim.validation),
    UpdateReferralRewardClaim.controller,
);
router.post(
    '/:uuid/claims/approve',
    guard.check(['referral_rewards:read', 'referral_rewards:write']),
    assertRequestInput(ApproveReferralRewardClaims.validation),
    ApproveReferralRewardClaims.controller,
);
router.delete(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(DeleteReferralReward.validation),
    DeleteReferralReward.controller,
);
export default router;
