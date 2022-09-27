import { Router } from 'express';

import { upload } from '@thxnetwork/api/util/multer';

import PutUpload from './put.controller';

const router = Router();

router.put('/', upload.single('file'), PutUpload.controller);

export default router;
