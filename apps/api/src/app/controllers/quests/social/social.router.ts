import express from 'express';
import { assertRequestInput, assertAccount } from '@thxnetwork/api/middlewares';
import { limitInSeconds } from '@thxnetwork/api/util/ratelimiter';
import * as Create from './entries/post.controller';

export const router: express.Router = express.Router({ mergeParams: true });

router.post('/:id/entries', limitInSeconds(3), assertRequestInput(Create.validation), assertAccount, Create.controller);

export default router;
