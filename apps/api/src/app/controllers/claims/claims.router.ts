import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadClaim from './get.controller';
import PostClaimCollect from './collect/post.controller';

const router = express.Router();

router.post(
    '/:uuid/collect',
    guard.check(['claims:read']),
    assertRequestInput(PostClaimCollect.validation),
    PostClaimCollect.controller,
);
router.get('/:id', guard.check(['claims:read']), assertRequestInput(ReadClaim.validation), ReadClaim.controller);

export default router;
