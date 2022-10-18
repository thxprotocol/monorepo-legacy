import express from 'express';
import { guard, assertRequestInput } from '@thxnetwork/api/middlewares';
import CreateWallet from './post.controller';
import ListWallets from './list.controller';

const router = express.Router();

router.get('/', guard.check(['wallets:read']), ListWallets.controller);
router.post('/', guard.check(['wallets:write']), assertRequestInput(CreateWallet.validation), CreateWallet.controller);

export default router;
