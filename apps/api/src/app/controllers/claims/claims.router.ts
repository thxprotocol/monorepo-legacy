import express from 'express';
import { assertRequestInput, checkJwt, corsHandler, guard } from '@thxnetwork/api/middlewares';
import ReadClaim from './get.controller';
import ReadClaimRedirect from './redirect/get.controller';
import PostClaimCollect from './collect/post.controller';

const router = express.Router();

router.post(
    '/:uuid/collect',
    checkJwt,
    corsHandler,
    guard.check(['claims:read']),
    assertRequestInput(PostClaimCollect.validation),
    PostClaimCollect.controller,
);
router.get('/:uuid', assertRequestInput(ReadClaim.validation), ReadClaim.controller);
router.get('/r/:uuid', assertRequestInput(ReadClaimRedirect.validation), ReadClaimRedirect.controller);

export default router;
