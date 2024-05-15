import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ReadMetadata from './get.controller';
import * as ReadERC1155Metadata from './erc1155/get.controller';

const router: express.Router = express.Router();

router.get(
    '/erc1155/:erc1155Id/:tokenId',
    assertRequestInput(ReadERC1155Metadata.validation),
    ReadERC1155Metadata.controller,
);
router.get('/:metadataId', assertRequestInput(ReadMetadata.validation), ReadMetadata.controller);

export default router;
