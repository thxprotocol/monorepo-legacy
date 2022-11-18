import express from 'express';
import {
    assertAssetPoolAccess,
    assertRequestInput,
    requireAssetPoolHeader,
    guard,
    assertPlan,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateRewardNft from './post.controller';
import ReadRewardNft from './get.controller';
import UpdateRewardNft from './patch.controller';
import ListRewardNft from './list.controller';
import ListClaimsQRCode from './claims/qrcode/get.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListRewardNft.controller,
);
router.get(
    '/:id',
    guard.check(['rewards:read']),
    //assertAssetPoolAccess,
    assertRequestInput(ReadRewardNft.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadRewardNft.controller,
);
router.post(
    '/',
    guard.check(['rewards:write', 'rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateRewardNft.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateRewardNft.controller,
);
router.patch(
    '/:id',
    guard.check(['rewards:write', 'rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateRewardNft.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateRewardNft.controller,
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

export default router;
