import express from 'express';
import {
    assertAssetPoolAccess,
    assertRequestInput,
    requireAssetPoolHeader,
    guard,
    assertPlan,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateERC721Reward from './post.controller';
import ReadERC721Reward from './get.controller';
import UpdateERC721Reward from './patch.controller';
import ListERC721Reward from './list.controller';
import DeleteERC721Reward from './delete.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListERC721Reward.controller,
);
router.get(
    '/:id',
    guard.check(['rewards:read']),
    //assertAssetPoolAccess,
    assertRequestInput(ReadERC721Reward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadERC721Reward.controller,
);
router.post(
    '/',
    guard.check(['rewards:write', 'rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateERC721Reward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateERC721Reward.controller,
);
router.patch(
    '/:id',
    guard.check(['rewards:write', 'rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateERC721Reward.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateERC721Reward.controller,
);
router.delete(
    '/:id',
    guard.check(['rewards:write', 'rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(DeleteERC721Reward.validation),
    DeleteERC721Reward.controller,
);

export default router;
