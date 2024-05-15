import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import * as ListWallets from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListWallets.validation),
    ListWallets.controller,
);

export default router;
