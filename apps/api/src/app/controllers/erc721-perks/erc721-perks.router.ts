import express from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateERC721Perk from './post.controller';
import ReadERC721Perk from './get.controller';
import UpdateERC721Perk from './patch.controller';
import ListERC721Perk from './list.controller';
import DeleteERC721Perk from './delete.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get('/', guard.check(['erc721_rewards:read']), assertPoolAccess, ListERC721Perk.controller);

router.get(
    '/:id',
    guard.check(['erc721_rewards:read']),
    assertPoolAccess,
    assertRequestInput(ReadERC721Perk.validation),
    ReadERC721Perk.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertPoolAccess,
    assertRequestInput(CreateERC721Perk.validation),
    CreateERC721Perk.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertPoolAccess,
    assertRequestInput(UpdateERC721Perk.validation),
    UpdateERC721Perk.controller,
);
router.delete(
    '/:id',
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertPoolAccess,
    assertRequestInput(DeleteERC721Perk.validation),
    DeleteERC721Perk.controller,
);

export default router;
