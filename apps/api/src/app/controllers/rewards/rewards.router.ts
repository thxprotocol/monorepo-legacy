import { checkJwt, corsHandler, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';
import CreateReferralRewardClaim from './referral/claim/post.controller';
import CreatePointRewardClaim from './points/claim/post.controller';
import MilestoneRewardClaim from './milestones/claim/post.controller';
import rateLimit from 'express-rate-limit';

const router = express.Router();

router.get('/', ListRewards.controller);
router.post('/referral/:uuid/claim', rateLimit({ windowMs: 1 * 1000, max: 1 }), CreateReferralRewardClaim.controller);
router.use(checkJwt).use(corsHandler).post('/points/:uuid/claim', CreatePointRewardClaim.controller);
router
    .use(checkJwt)
    .use(corsHandler)
    .post('/milestone/:uuid/claim', requireAssetPoolHeader, MilestoneRewardClaim.controller);

export default router;
