import express from 'express';
import { assertRequestInput, assertAssetPoolAccess, requireAssetPoolHeader, guard } from '@thxnetwork/api/middlewares';
import ListTransactions from './list.controller';
import ReadTransaction from './get.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['transactions:read']),
    requireAssetPoolHeader,
    assertAssetPoolAccess,
    assertRequestInput(ListTransactions.validation),
    ListTransactions.controller,
);

router.get(
    '/:id',
    guard.check(['transactions:read']),
    assertRequestInput(ReadTransaction.validation),
    ReadTransaction.controller,
);

export default router;
