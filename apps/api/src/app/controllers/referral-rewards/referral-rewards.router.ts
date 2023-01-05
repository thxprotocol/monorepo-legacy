import express from 'express';
import {
    assertAssetPoolOwnership,
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
import DeleteReferralReward from './delete.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['referral_rewards:read']),
    assertAssetPoolOwnership,
    requireAssetPoolHeader,
    assertRequestInput(ListReferralReward.validation),
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListReferralReward.controller,
);
router.get(
    '/:id',
    guard.check(['referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ReadReferralReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadReferralReward.controller,
);
router.post(
    '/',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(CreateReferralReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateReferralReward.controller,
);
router.patch(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(UpdateReferralReward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateReferralReward.controller,
);
router.delete(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolOwnership,
    requireAssetPoolHeader,
    assertRequestInput(DeleteReferralReward.validation),
    DeleteReferralReward.controller,
);
export default router;
