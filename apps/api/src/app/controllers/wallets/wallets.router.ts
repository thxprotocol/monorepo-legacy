import express from 'express';
import { guard, assertRequestInput } from '@thxnetwork/api/middlewares';
import ReadWallets from './get.controller';
import ListWallets from './list.controller';
import CreateWalletUpgrade from './upgrade/post.controller';
import CreateWalletConfirm from './confirm/post.controller';

const router = express.Router();
router.get('/', guard.check(['wallets:read']), assertRequestInput(ListWallets.validation), ListWallets.controller);
router.get('/:id', guard.check(['wallets:read']), assertRequestInput(ReadWallets.validation), ReadWallets.controller);

router.post(
    '/:id/confirm',
    guard.check(['wallets:write']),
    assertRequestInput(CreateWalletConfirm.validation),
    CreateWalletConfirm.controller,
);

router.post(
    '/:id/upgrade',
    guard.check(['wallets:write']),
    assertRequestInput(CreateWalletUpgrade.validation),
    CreateWalletUpgrade.controller,
);

export default router;
