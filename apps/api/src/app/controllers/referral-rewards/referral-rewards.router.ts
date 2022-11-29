import express from 'express';
import {
    assertAssetPoolAccess,
    assertRequestInput,
    requireAssetPoolHeader,
    guard,
    assertPlan,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateRewardReferral from './post.controller';
import ReadRewardReferral from './get.controller';
import UpdateRewardReferral from './patch.controller';
import ListRewardReferral from './list.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['referral_rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(ListRewardReferral.validation),
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListRewardReferral.controller,
);
router.get(
    '/:id',
    guard.check(['referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(ReadRewardReferral.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadRewardReferral.controller,
);
router.post(
    '/',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateRewardReferral.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateRewardReferral.controller,
);
router.patch(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateRewardReferral.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateRewardReferral.controller,
);
export default router;
