import { checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListQuests from './list.controller';
import ListQuestsPublic from './recent/list.controller';
import RouterQuestSocial from './social/social.router';
import RouterQuestWeb3 from './web3/web3.router';
import RouterQuestGitcoin from './gitcoin/gitcoin.router';
import RouterQuestDaily from './daily/daily.router';
import RouterQuestCustom from './custom/custom.router';
import RouterQuestWebhook from './webhook/webhook.router';

const router = express.Router();

router.get('/', ListQuests.controller);
router.get('/public', ListQuestsPublic.controller);
router.use(checkJwt).use(corsHandler);
router.use('/social', RouterQuestSocial);
router.use('/web3', RouterQuestWeb3);
router.use('/gitcoin', RouterQuestGitcoin);
router.use('/daily', RouterQuestDaily);
router.use('/custom', RouterQuestCustom);
router.use('/webhook', RouterQuestWebhook);

export default router;
