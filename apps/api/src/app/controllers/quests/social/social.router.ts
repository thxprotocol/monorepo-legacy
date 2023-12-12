import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import ReadQuestSocial from './get.controller';
import CreateQuestSocialClaim from './claim/post.controller';

export const router = express.Router();

router.get('/:id', assertRequestInput(ReadQuestSocial.validation), ReadQuestSocial.controller);
router.post('/:id/claim', assertRequestInput(CreateQuestSocialClaim.validation), CreateQuestSocialClaim.controller);

export default router;
