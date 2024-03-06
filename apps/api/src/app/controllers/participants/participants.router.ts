import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListParticipants from './get.controller';
import UpdateParticipants from './patch.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['point_balances:read']),
    assertRequestInput(ListParticipants.validation),
    ListParticipants.controller,
);
router.patch(
    '/:id',
    guard.check(['point_balances:read']),
    assertRequestInput(UpdateParticipants.validation),
    UpdateParticipants.controller,
);

export default router;
