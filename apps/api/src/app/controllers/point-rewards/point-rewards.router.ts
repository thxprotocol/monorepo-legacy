import { requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPointRewards from './list.controller';

const router = express.Router();

router.get('/', requireAssetPoolHeader, ListPointRewards.controller);

export default router;
