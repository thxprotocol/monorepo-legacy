import { checkJwt, corsHandler, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';
import CreateReferralRewardClaim from './referral/claim/post.controller';
import CreatePointRewardClaim from './points/claim/post.controller';

const router = express.Router();

router.get('/', requireAssetPoolHeader, ListRewards.controller);
router.post('/referral/:uuid/claim', CreateReferralRewardClaim.controller);
router
    .use(checkJwt)
    .use(corsHandler)
    .post('/points/:uuid/claim', requireAssetPoolHeader, CreatePointRewardClaim.controller);

export default router;
