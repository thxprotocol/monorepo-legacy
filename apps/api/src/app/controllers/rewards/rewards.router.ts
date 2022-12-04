import { checkJwt, corsHandler, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';
import CreateRewardClaim from './claim/post.controller';

const router = express.Router();

router.get('/', requireAssetPoolHeader, ListRewards.controller);
router.use(checkJwt).use(corsHandler).post('/:uuid/claim', requireAssetPoolHeader, CreateRewardClaim.controller);

export default router;
