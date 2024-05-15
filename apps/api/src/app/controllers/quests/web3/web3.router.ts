import express from 'express';
import * as Create from './entries/post.controller';
import { assertAccount, assertRequestInput } from '@thxnetwork/api/middlewares';
import { limitInSeconds } from '@thxnetwork/api/util/ratelimiter';

const router: express.Router = express.Router({ mergeParams: true });

router.post('/:id/entries', limitInSeconds(3), assertRequestInput(Create.validation), assertAccount, Create.controller);

export default router;
