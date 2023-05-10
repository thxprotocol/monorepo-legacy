import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import ReadMetadata from './get.controller';

const router = express.Router();

router.get('/:metadataId', assertRequestInput(ReadMetadata.validation), ReadMetadata.controller);

export default router;
