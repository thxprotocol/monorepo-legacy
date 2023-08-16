import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';
import CreateReferralRewardClaim from './referral/claim/post.controller';
import CreatePointRewardClaim from './points/claim/post.controller';
import MilestoneRewardClaim from './milestones/claim/post.controller';
import CreateDailyRewardClaim from './daily/claim/post.controller';
import CreateWeb3QuestClaim from './web3/complete/post.controller';
import rateLimit from 'express-rate-limit';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';

const router = express.Router();

router.get('/', ListRewards.controller);
router.post(
    '/referral/:uuid/claim',
    rateLimit((() => (NODE_ENV !== 'test' ? { windowMs: 1 * 1000, max: 1 } : {}))()),
    assertRequestInput(CreateReferralRewardClaim.validation),
    CreateReferralRewardClaim.controller,
);
router.use(checkJwt).use(corsHandler).post('/points/:id/claim', CreatePointRewardClaim.controller);
router.use(checkJwt).use(corsHandler).post('/daily/:id/claim', CreateDailyRewardClaim.controller);
router.use(checkJwt).use(corsHandler).post('/milestones/claims/:uuid/collect', MilestoneRewardClaim.controller);
router.use(checkJwt).use(corsHandler).post('/web3/:uuid/claim', CreateWeb3QuestClaim.controller);

export default router;
