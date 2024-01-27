import express from 'express';
// import Read from './get.controller';
import Create from './entries/post.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import { limitInSeconds } from '@thxnetwork/api/util/ratelimiter';

export const router = express.Router({ mergeParams: true });

// router.get('/:id', assertRequestInput(Read.validation), Read.controller);
router.post('/:uuid/claim', limitInSeconds, assertRequestInput(Create.validation), Create.controller);

export default router;
