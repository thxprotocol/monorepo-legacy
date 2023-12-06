import express from 'express';
import { guard, assertRequestInput } from '@thxnetwork/api/middlewares';
import ListTransactions from './list.controller';

const router = express.Router();
router.get(
    '/',
    guard.check(['transactions:read']),
    assertRequestInput(ListTransactions.validation),
    ListTransactions.controller,
);

export default router;
