import { assertAccount, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListParticipants from './get.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['point_balances:read']),
    assertRequestInput(ListParticipants.validation),
    assertAccount,
    ListParticipants.controller,
);

export default router;
