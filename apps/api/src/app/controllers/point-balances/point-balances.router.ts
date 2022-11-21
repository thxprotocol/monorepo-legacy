import { guard, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import GetPointBalance from './get.controller';
import UpdatePointBalance from './patch.controller';

const router = express.Router();

router.get('/', guard.check(['point_balances:read']), requireAssetPoolHeader, GetPointBalance.controller);
router.patch(
    '/',
    guard.check(['point_balances:read', 'point_balances:write']),
    requireAssetPoolHeader,
    UpdatePointBalance.controller,
);

export default router;
