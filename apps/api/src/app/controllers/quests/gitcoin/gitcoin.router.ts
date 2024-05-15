import express from 'express';
import * as CreateEntry from './entries/post.controller';
import { assertRequestInput, assertAccount } from '@thxnetwork/api/middlewares';
import { limitInSeconds } from '@thxnetwork/api/util/ratelimiter';

export const router: express.Router = express.Router({ mergeParams: true });

router.post(
    '/:id/entries',
    limitInSeconds(3),
    assertRequestInput(CreateEntry.validation),
    assertAccount,
    CreateEntry.controller,
);

export default router;
