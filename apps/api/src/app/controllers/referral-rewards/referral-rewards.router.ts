import express from 'express';
import { assertPoolAccess, assertQuestAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateReferralReward from './post.controller';
import ReadReferralReward from './get.controller';
import UpdateReferralReward from './patch.controller';
import ListReferralReward from './list.controller';
import ListReferralRewardClaims from './claims/list.controller';
import CreateReferralRewardClaim from './claims/post.controller';
import UpdateReferralRewardClaim from './claims/patch.controller';
import ApproveReferralRewardClaims from './claims/approve/post.controller';
import DeleteReferralReward from './delete.controller';
import { upload } from '@thxnetwork/api/util/multer';
import { QuestVariant } from '@thxnetwork/types/enums';

const router = express.Router();

router.get(
    '/',
    guard.check(['referral_rewards:read']),
    assertPoolAccess,
    assertRequestInput(ListReferralReward.validation),
    ListReferralReward.controller,
);
router.get(
    '/:id',
    guard.check(['referral_rewards:read']),
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Invite),
    assertRequestInput(ReadReferralReward.validation),
    ReadReferralReward.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Invite),
    assertRequestInput(UpdateReferralReward.validation),
    UpdateReferralReward.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertPoolAccess,
    assertRequestInput(CreateReferralReward.validation),
    CreateReferralReward.controller,
);
router.delete(
    '/:id',
    guard.check(['referral_rewards:write', 'referral_rewards:read']),
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Invite),
    assertRequestInput(DeleteReferralReward.validation),
    DeleteReferralReward.controller,
);

router.get(
    '/:uuid/claims',
    guard.check(['referral_rewards:read']),
    assertPoolAccess,
    assertRequestInput(ListReferralRewardClaims.validation),
    ListReferralRewardClaims.controller,
);
router.post(
    '/:uuid/claims',
    guard.check(['referral_rewards:read', 'referral_rewards:write']),
    assertPoolAccess,
    assertRequestInput(CreateReferralRewardClaim.validation),
    CreateReferralRewardClaim.controller,
);
router.patch(
    '/:uuid/claims/:id',
    guard.check(['referral_rewards:read', 'referral_rewards:write']),
    assertPoolAccess,
    assertRequestInput(UpdateReferralRewardClaim.validation),
    UpdateReferralRewardClaim.controller,
);
router.post(
    '/:uuid/claims/approve',
    guard.check(['referral_rewards:read', 'referral_rewards:write']),
    assertPoolAccess,
    assertRequestInput(ApproveReferralRewardClaims.validation),
    ApproveReferralRewardClaims.controller,
);
export default router;
