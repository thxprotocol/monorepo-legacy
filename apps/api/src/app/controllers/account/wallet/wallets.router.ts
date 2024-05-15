import express from 'express';
import * as ListWallets from './list.controller';
import * as CreateWallets from './post.controller';
import * as CreateWalletConfirm from './confirm/post.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', guard.check(['account:read']), assertRequestInput(ListWallets.validation), ListWallets.controller);
router.post(
    '/',
    guard.check(['account:read', 'account:write']),
    assertRequestInput(CreateWallets.validation),
    CreateWallets.controller,
);
router.post(
    '/confirm',
    guard.check(['account:read', 'account:write']),
    assertRequestInput(CreateWalletConfirm.validation),
    CreateWalletConfirm.controller,
);

export default router;
