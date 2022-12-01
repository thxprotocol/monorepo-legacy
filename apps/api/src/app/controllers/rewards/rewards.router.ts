import { requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';

const router = express.Router();

router.get('/', requireAssetPoolHeader, ListRewards.controller);

export default router;
