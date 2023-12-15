import express from 'express';
import CreateIdentity from './post.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.post('/', assertRequestInput(CreateIdentity.validation), CreateIdentity.controller);

export default router;
