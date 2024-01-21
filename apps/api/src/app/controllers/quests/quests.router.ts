import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListQuests from './list.controller';
import ListQuestsPublic from './public/list.controller';
import CreateQuestDailyClaim from './daily/claim/post.controller';
import CreateQuestInviteClaim from './invite/claim/post.controller';

import routerQuestSocial from './social/social.router';

import CreateQuestCustomClaim from './custom/claim/post.controller';
import CreateQuestWeb3Claim from './web3/complete/post.controller';
import CreateQuestGitcoinEntry from './gitcoin/entry/post.controller';
import rateLimit from 'express-rate-limit';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';

const router = express.Router();

router.get('/', ListQuests.controller);
router.get('/public', ListQuestsPublic.controller);

router.post(
    '/invite/:uuid/claim',
    rateLimit((() => (NODE_ENV !== 'test' ? { windowMs: 1 * 1000, max: 1 } : {}))()),
    assertRequestInput(CreateQuestInviteClaim.validation),
    CreateQuestInviteClaim.controller,
);

router.use(checkJwt).use(corsHandler);
router.use('/social', routerQuestSocial);

// TODO Refactor other quest endpoints as social router
router.post('/daily/:id/claim', CreateQuestDailyClaim.controller);
router.post('/custom/claims/:uuid/collect', CreateQuestCustomClaim.controller);
router.post('/web3/:uuid/claim', CreateQuestWeb3Claim.controller);
router.post('/gitcoin/:uuid/entry', CreateQuestGitcoinEntry.controller);

export default router;
