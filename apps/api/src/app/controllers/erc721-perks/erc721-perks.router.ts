import express from 'express';
import {
    assertAssetPoolAccess,
    assertRequestInput,
    requireAssetPoolHeader,
    guard,
    assertPlan,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateERC721Perk from './post.controller';
import ReadERC721Perk from './get.controller';
import UpdateERC721Perk from './patch.controller';
import ListERC721Perk from './list.controller';
import DeleteERC721Perk from './delete.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['erc721_rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ListERC721Perk.controller,
);
router.get(
    '/:id',
    guard.check(['erc721_rewards:read']),
    //assertAssetPoolAccess,
    assertRequestInput(ReadERC721Perk.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    ReadERC721Perk.controller,
);
router.post(
    '/',
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(CreateERC721Perk.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    CreateERC721Perk.controller,
);
router.patch(
    '/:id',
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertAssetPoolAccess,
    assertRequestInput(UpdateERC721Perk.validation),
    requireAssetPoolHeader,
    assertPlan([AccountPlanType.Basic, AccountPlanType.Premium]),
    UpdateERC721Perk.controller,
);
router.delete(
    '/:id',
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    assertRequestInput(DeleteERC721Perk.validation),
    DeleteERC721Perk.controller,
);

export default router;
