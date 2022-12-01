import { guard, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';

const router = express.Router();

router.get('/', guard.check(['rewards:read']), requireAssetPoolHeader, ListRewards.controller);

export default router;
