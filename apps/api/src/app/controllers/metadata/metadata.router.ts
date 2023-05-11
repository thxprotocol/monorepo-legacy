import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import ReadMetadata from './get.controller';

const router = express.Router();

router.get('/erc1155/:erc1155Id/:tokenId', assertRequestInput(ReadMetadata.validation), ReadMetadata.controller);
router.get('/:metadataId', assertRequestInput(ReadMetadata.validation), ReadMetadata.controller);

export default router;
