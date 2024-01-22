import express from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadERC721 from './get.controller';
import ListERC721 from './list.controller';
import ListERC721Metadata from './metadata/list.controller';
import ListERC721Token from './token/list.controller';
import ReadERC721Token from './token/get.controller';
import RemoveERC721 from './delete.controller';
import CreateERC721 from './post.controller';
import CreateMultipleERC721Metadata from './metadata/images/post.controller';
import { upload } from '@thxnetwork/api/util/multer';
import UpdateERC721 from './patch.controller';
import ReadERC721Metadata from './metadata/get.controller';
import CreateERC721Metadata from './metadata/post.controller';
import PatchERC721Metadata from './metadata/patch.controller';
import DeleteERC721Metadata from './metadata/delete.controller';
import ImportERC721Contract from './import/post.controller';
import PreviewERC721Contract from './import/preview/post.controller';
import CreateERC721Transfer from './transfer/post.controller';

const router = express.Router();

router.get(
    '/token',
    guard.check(['erc721:read']),
    assertRequestInput(ListERC721Token.validation),
    ListERC721Token.controller,
);
router.get('/token/:id', guard.check(['erc721:read']), ReadERC721Token.controller);
router.get('/', guard.check(['erc721:read']), assertRequestInput(ListERC721.validation), ListERC721.controller);
router.get('/:id', guard.check(['erc721:read']), assertRequestInput(ReadERC721.validation), ReadERC721.controller);

router.post(
    '/',
    upload.single('file'),
    guard.check(['erc721:read', 'erc721:write']),
    assertRequestInput(CreateERC721.validation),
    CreateERC721.controller,
);

router.post(
    '/transfer',
    // guard.check(['erc721_transfer:read', 'erc721_transfer:write']),
    assertRequestInput(CreateERC721Transfer.validation),
    CreateERC721Transfer.controller,
);
router.post(
    '/import',
    ImportERC721Contract.controller,
    assertPoolAccess,
    assertRequestInput(ImportERC721Contract.validation),
);
router.post('/preview', assertRequestInput(PreviewERC721Contract.validation), PreviewERC721Contract.controller);
router.patch(
    '/:id/metadata/:metadataId',
    guard.check(['erc721:write']),
    assertRequestInput(PatchERC721Metadata.validation),
    PatchERC721Metadata.controller,
);

router.delete(
    '/:id/metadata/:metadataId',
    guard.check(['erc721:write']),
    assertRequestInput(DeleteERC721Metadata.validation),
    DeleteERC721Metadata.controller,
);

router.get('/:id/metadata', guard.check(['erc721:read']), ListERC721Metadata.controller);

router.post(
    '/:id/metadata/',
    guard.check(['erc721:write']),
    assertRequestInput(CreateERC721Metadata.validation),
    CreateERC721Metadata.controller,
);

router.post(
    '/:id/metadata/zip',
    upload.single('file'),
    guard.check(['erc721:write']),
    assertRequestInput(CreateMultipleERC721Metadata.validation),
    CreateMultipleERC721Metadata.controller,
);

router.patch(
    '/:id',
    guard.check(['erc721:write', 'erc721:read']),
    assertRequestInput(UpdateERC721.validation),
    UpdateERC721.controller,
);

router.get(
    '/:id/metadata/:metadataId',
    guard.check(['erc721:read']),
    ReadERC721Metadata.controller,
    assertRequestInput(ReadERC721Metadata.validation),
);

router.delete(
    '/:id',
    guard.check(['erc721:read', 'erc721:write']),
    assertRequestInput(RemoveERC721.validation),
    RemoveERC721.controller,
);

export default router;
