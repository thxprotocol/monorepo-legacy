import express from 'express';
import { guard, assertRequestInput } from '@thxnetwork/api/middlewares';
import ReadWallets from './get.controller';
import ListWallets from './list.controller';
import CreateWallet from './post.controller';

const router = express.Router();
router.get('/', guard.check(['wallets:read']), assertRequestInput(ListWallets.validation), ListWallets.controller);
router.post('/', guard.check(['wallets:write']), assertRequestInput(CreateWallet.validation), CreateWallet.controller);
router.get('/:id', guard.check(['wallets:read']), assertRequestInput(ReadWallets.validation), ReadWallets.controller);

export default router;
