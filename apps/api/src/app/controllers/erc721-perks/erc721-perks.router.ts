import express from 'express';
import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateERC721Perk from './post.controller';
import ReadERC721Perk from './get.controller';
import UpdateERC721Perk from './patch.controller';
import ListERC721Perk from './list.controller';
import ListERC721TokenImported from './import/list.controller';
import DeleteERC721Perk from './delete.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get(
    '/import',
    guard.check(['erc721_rewards:read']),
    assertAssetPoolOwnership,
    ListERC721TokenImported.controller,
    assertRequestInput(ListERC721TokenImported.validation),
);
router.get('/', guard.check(['erc721_rewards:read']), assertAssetPoolOwnership, ListERC721Perk.controller);

router.get(
    '/:id',
    guard.check(['erc721_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ReadERC721Perk.validation),
    ReadERC721Perk.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(CreateERC721Perk.validation),
    CreateERC721Perk.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(UpdateERC721Perk.validation),
    UpdateERC721Perk.controller,
);
router.delete(
    '/:id',
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(DeleteERC721Perk.validation),
    DeleteERC721Perk.controller,
);

export default router;
