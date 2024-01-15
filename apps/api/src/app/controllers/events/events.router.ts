import express from 'express';
import CreateEvents from './post.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.post('/', assertRequestInput(CreateEvents.validation), CreateEvents.controller);

export default router;
