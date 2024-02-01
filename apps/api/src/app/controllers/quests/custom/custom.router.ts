import express from 'express';
import Create from './entries/post.controller';
import { assertRequestInput, assertAccount } from '@thxnetwork/api/middlewares';
import { limitInSeconds } from '@thxnetwork/api/util/ratelimiter';

export const router = express.Router({ mergeParams: true });

router.post(
    '/claims/:uuid/collect',
    limitInSeconds(3),
    assertRequestInput(Create.validation),
    assertAccount,
    Create.controller,
);

export default router;
