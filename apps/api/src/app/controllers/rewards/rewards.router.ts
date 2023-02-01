import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';
import CreateReferralRewardClaim from './referral/claim/post.controller';
import CreatePointRewardClaim from './points/claim/post.controller';
import MilestoneRewardClaim from './milestones/claim/post.controller';
import CreateDailyRewardClaim from './daily/claim/post.controller';
import rateLimit from 'express-rate-limit';

const router = express.Router();

router.get('/', ListRewards.controller);
router.post(
    '/referral/:uuid/claim',
    rateLimit({ windowMs: 1 * 1000, max: 1 }),
    assertRequestInput(CreateReferralRewardClaim.validation),
    CreateReferralRewardClaim.controller,
);
router.use(checkJwt).use(corsHandler).post('/points/:uuid/claim', CreatePointRewardClaim.controller);
router.use(checkJwt).use(corsHandler).post('/milestones/claims/:uuid/collect', MilestoneRewardClaim.controller);
router.use(checkJwt).use(corsHandler).post('/daily/:uuid/claim', CreateDailyRewardClaim.controller);

export default router;
