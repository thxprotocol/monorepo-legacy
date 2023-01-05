import express from 'express';
import { assertAssetPoolOwnership, assertRequestInput, guard, assertPlan } from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateReferralReward from './post.controller';
import ReadReferralReward from './get.controller';
import UpdateReferralReward from './patch.controller';
import ListReferralReward from './list.controller';
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
router.post(
    '/',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(CreateReferralReward.validation),
    CreateReferralReward.controller,
);
router.patch(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(UpdateReferralReward.validation),
    UpdateReferralReward.controller,
);
router.delete(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(DeleteReferralReward.validation),
    DeleteReferralReward.controller,
);
export default router;
