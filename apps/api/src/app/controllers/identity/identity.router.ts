import express from 'express';
import CreateController from './post.controller';
import UpdateController from './patch.controller';
import ReadController from './get.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.get('/:salt', assertRequestInput(ReadController.validation), ReadController.controller);
router.patch('/:uuid', assertRequestInput(UpdateController.validation), UpdateController.controller);
router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);

export default router;
