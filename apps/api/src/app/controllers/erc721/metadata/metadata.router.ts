import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import ReadERC721MetadataAttributes from './attributes/get.controller';
import DeleteMetadata from './delete.controller';

const router = express.Router();

router.get(
    '/:metadataId',
    assertRequestInput(ReadERC721MetadataAttributes.validation),
    ReadERC721MetadataAttributes.controller,
);

router.delete('/:metadataId', assertRequestInput(DeleteMetadata.validation), DeleteMetadata.controller);

export default router;
