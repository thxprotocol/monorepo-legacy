import { requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import GetPointBalance from './get.controller';
import UpdatePointBalance from './patch.controller';

const router = express.Router();

router.get('/', requireAssetPoolHeader, GetPointBalance.controller);
router.patch('/', requireAssetPoolHeader, UpdatePointBalance.controller);

export default router;
