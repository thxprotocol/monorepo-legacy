import { guard, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import GetPointBalance from './get.controller';

const router = express.Router();

router.get('/', guard.check(['point_balances:read']), requireAssetPoolHeader, GetPointBalance.controller);

export default router;
