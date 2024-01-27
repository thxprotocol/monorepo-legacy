import express from 'express';
import Create from './entries/post.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import { limitInSeconds } from '@thxnetwork/api/util/ratelimiter';

export const router = express.Router({ mergeParams: true });

router.post('/:id/claim', limitInSeconds(3), assertRequestInput(Create.validation), Create.controller);

export default router;
