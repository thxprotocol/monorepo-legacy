import express from 'express';
import {
    assertAssetPoolOwnership,
    assertRequestInput,
    requireAssetPoolHeader,
    guard,
    assertPlan,
} from '@thxnetwork/api/middlewares';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import CreateERC20Perk from './post.controller';
import ReadERC20Perk from './get.controller';
import UpdateERC20Perk from './patch.controller';
import ListERC20Perk from './list.controller';
import DeleteERC20Perk from './delete.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get('/', guard.check(['erc20_rewards:read']), assertAssetPoolOwnership, ListERC20Perk.controller);
router.get(
    '/:id',
    guard.check(['erc20_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ReadERC20Perk.validation),
    ReadERC20Perk.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(CreateERC20Perk.validation),
    CreateERC20Perk.controller,
);

router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(UpdateERC20Perk.validation),
    UpdateERC20Perk.controller,
);

router.delete(
    '/:id',
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(DeleteERC20Perk.validation),
    DeleteERC20Perk.controller,
);

export default router;
