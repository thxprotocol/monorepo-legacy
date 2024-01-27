import express from 'express';
import { guard, assertRequestInput } from '@thxnetwork/api/middlewares';
import ReadWallets from './get.controller';
import ListWallets from './list.controller';

const router = express.Router();

router.get('/', guard.check(['wallets:read']), assertRequestInput(ListWallets.validation), ListWallets.controller);
router.get('/:id', guard.check(['wallets:read']), assertRequestInput(ReadWallets.validation), ReadWallets.controller);

export default router;
