import express from 'express';
import { assertAuthorization, assertInteraction } from '@thxnetwork/auth/middlewares';
import Read from './get.controller';

const router = express.Router();

router.get('/me', assertInteraction, assertAuthorization, Read.controller);

export default router;
