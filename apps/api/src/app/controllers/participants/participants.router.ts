import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import * as ListParticipants from './get.controller';
import * as UpdateParticipants from './patch.controller';

const router: express.Router = express.Router();

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
