import express from 'express';
import CreateEvents from './post.controller';
import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.use(checkJwt).use(corsHandler);
router.post('/', assertRequestInput(CreateEvents.validation), CreateEvents.controller);

export default router;
