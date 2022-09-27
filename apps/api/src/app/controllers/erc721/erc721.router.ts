import express from 'express';
import { assertRequestInput, requireAssetPoolHeader, guard } from '@thxnetwork/api/middlewares';
import ReadERC721 from './get.controller';
import ListERC721 from './list.controller';
import ListERC721Metadata from './metadata/list.controller';
import ListERC721Token from './token/list.controller';
import ReadERC721Token from './token/get.controller';
import CreateERC721 from './post.controller';
import CreateERC721Metadata from './metadata/post.controller';
import MintERC721Metadata from './metadata/mint/post.controller';
import CreateMultipleERC721Metadata from './metadata/images/post.controller';
import DownloadERC721MetadataCSV from './metadata/csv/get.controller';
import UploadERC721MetadataCSV from './metadata/csv/post.controller';
import { upload } from '@thxnetwork/api/util/multer';
import UpdateERC721 from './patch.controller';
import ReadERC721Metadata from './metadata/get.controller';
import PatchERC721Metadata from './metadata/patch.controller';

const router = express.Router();

router.get('/token', guard.check(['erc721:read']), ListERC721Token.controller);
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
    '/:id/metadata/:metadataId/mint',
    guard.check(['erc721:write']),
    requireAssetPoolHeader,
    assertRequestInput(MintERC721Metadata.validation),
    MintERC721Metadata.controller,
);

router.patch(
    '/:id/metadata/:metadataId',
    guard.check(['erc721:write']),
    requireAssetPoolHeader,
    assertRequestInput(PatchERC721Metadata.validation),
    PatchERC721Metadata.controller,
);

router.get('/:id/metadata', guard.check(['erc721:read']), ListERC721Metadata.controller);

router.post(
    '/:id/metadata/',
    guard.check(['erc721:write']),
    requireAssetPoolHeader,
    assertRequestInput(CreateERC721Metadata.validation),
    CreateERC721Metadata.controller,
);
router.post(
    '/:id/metadata/zip',
    upload.single('file'),
    guard.check(['erc721:write']),
    requireAssetPoolHeader,
    assertRequestInput(CreateMultipleERC721Metadata.validation),
    CreateMultipleERC721Metadata.controller,
);
router.get(
    '/:id/metadata/csv',
    guard.check(['erc721:read']),
    requireAssetPoolHeader,
    assertRequestInput(DownloadERC721MetadataCSV.validation),
    DownloadERC721MetadataCSV.controller,
);

router.post(
    '/:id/metadata/csv',
    upload.single('file'),
    guard.check(['erc721:read', 'erc721:write']),
    requireAssetPoolHeader,
    assertRequestInput(UploadERC721MetadataCSV.validation),
    UploadERC721MetadataCSV.controller,
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

export default router;
