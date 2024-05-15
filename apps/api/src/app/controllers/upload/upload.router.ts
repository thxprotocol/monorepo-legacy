import express, { Router } from 'express';
import { upload } from '@thxnetwork/api/util/multer';
import * as PutUpload from './put.controller';

const router: express.Router = express.Router();

router.put('/', upload.single('file'), PutUpload.controller);

export default router;
