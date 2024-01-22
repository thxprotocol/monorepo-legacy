import express from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadERC1155 from './get.controller';
import ListERC1155 from './list.controller';
import RemoveERC1155 from './delete.controller';
import ListERC1155Metadata from './metadata/list.controller';
import ListERC1155Token from './token/list.controller';
import ReadERC1155Token from './token/get.controller';
import CreateERC1155 from './post.controller';
import CreateERC1155Metadata from './metadata/post.controller';

import { upload } from '@thxnetwork/api/util/multer';
import UpdateERC1155 from './patch.controller';
import ReadERC1155Metadata from './metadata/get.controller';
import PatchERC1155Metadata from './metadata/patch.controller';
import DeleteERC1155Metadata from './metadata/delete.controller';
import ImportERC1155Contract from './import/post.controller';
import PreviewERC1155Contract from './import/preview/post.controller';
import CreateERC1155Transfer from './transfer/post.controller';

const router = express.Router();

router.get(
    '/token',
    guard.check(['erc1155:read']),
    assertRequestInput(ListERC1155Token.validation),
    ListERC1155Token.controller,
);
router.get('/token/:id', guard.check(['erc1155:read']), ReadERC1155Token.controller);
router.get('/', guard.check(['erc1155:read']), assertRequestInput(ListERC1155.validation), ListERC1155.controller);
router.get('/:id', guard.check(['erc1155:read']), assertRequestInput(ReadERC1155.validation), ReadERC1155.controller);

router.post(
    '/',
    upload.single('file'),
    guard.check(['erc1155:read', 'erc1155:write']),
    assertRequestInput(CreateERC1155.validation),
    CreateERC1155.controller,
);
router.post(
    '/import',
    ImportERC1155Contract.controller,
    assertPoolAccess,
    assertRequestInput(ImportERC1155Contract.validation),
);
router.post('/preview', assertRequestInput(PreviewERC1155Contract.validation), PreviewERC1155Contract.controller);
router.patch(
    '/:id/metadata/:metadataId',
    guard.check(['erc1155:write']),
    assertRequestInput(PatchERC1155Metadata.validation),
    PatchERC1155Metadata.controller,
);

router.delete(
    '/:id/metadata/:metadataId',
    guard.check(['erc1155:write']),
    assertRequestInput(DeleteERC1155Metadata.validation),
    DeleteERC1155Metadata.controller,
);

router.get('/:id/metadata', guard.check(['erc1155:read']), ListERC1155Metadata.controller);

router.post(
    '/:id/metadata/',
    guard.check(['erc1155:write']),
    assertRequestInput(CreateERC1155Metadata.validation),
    CreateERC1155Metadata.controller,
);

router.patch(
    '/:id',
    guard.check(['erc1155:write', 'erc1155:read']),
    assertRequestInput(UpdateERC1155.validation),
    UpdateERC1155.controller,
);

router.get(
    '/:id/metadata/:metadataId',
    guard.check(['erc1155:read']),
    ReadERC1155Metadata.controller,
    assertRequestInput(ReadERC1155Metadata.validation),
);

router.post(
    '/transfer',
    // guard.check(['erc1155_transfer:read', 'erc1155_transfer:write']),
    assertRequestInput(CreateERC1155Transfer.validation),
    CreateERC1155Transfer.controller,
);

router.delete(
    '/:id',
    guard.check(['erc1155:read', 'erc1155:write']),
    assertRequestInput(RemoveERC1155.validation),
    RemoveERC1155.controller,
);

export default router;
