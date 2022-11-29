import { requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPointRewards from './list.controller';
import CreatePointRewards from './list.controller';

const router = express.Router();

router.get('/', requireAssetPoolHeader, ListPointRewards.controller);
router.post('/', requireAssetPoolHeader, CreatePointRewards.controller);

export default router;
