import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import * as ReadBalances from './get.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(ReadBalances.validation),
    ReadBalances.controller,
);

export default router;
