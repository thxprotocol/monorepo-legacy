import express from 'express';
import { guard, assertRequestInput } from '@thxnetwork/api/middlewares';
import CreateWallet from './post.controller';
import ReadWallets from './get.controller';
import UpdateWallet from './patch.controller';
import ListWallets from './list.controller';
import ListWalletManagers from './managers/list.controller';
import CreateWalletManager from './managers/post.controller';
import DeleteWalletManager from './managers/delete.controller';
import CreateWalletUpgrade from './upgrade/post.controller';
import CreateWalletConfirm from './confirm/post.controller';

const router = express.Router();
router.get('/', guard.check(['wallets:read']), assertRequestInput(ListWallets.validation), ListWallets.controller);
router.get('/:id', guard.check(['wallets:read']), assertRequestInput(ReadWallets.validation), ReadWallets.controller);
router.post('/', guard.check(['wallets:write']), assertRequestInput(CreateWallet.validation), CreateWallet.controller);
router.patch(
    '/:id',
    guard.check(['wallets:write']),
    assertRequestInput(UpdateWallet.validation),
    UpdateWallet.controller,
);

router.get(
    '/:id/managers',
    guard.check(['wallets:read']),
    assertRequestInput(ListWalletManagers.validation),
    ListWalletManagers.controller,
);
router.post(
    '/:id/managers',
    guard.check(['wallets:write']),
    assertRequestInput(CreateWalletManager.validation),
    CreateWalletManager.controller,
);

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

router.delete(
    '/managers/:id',
    guard.check(['wallets:write']),
    assertRequestInput(DeleteWalletManager.validation),
    DeleteWalletManager.controller,
);
export default router;
