import { requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPerks from './list.controller';

const router = express.Router();

router.get('/', requireAssetPoolHeader, ListPerks.controller);

export default router;
