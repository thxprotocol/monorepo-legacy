import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import * as ListParticipants from './list.controller';
import * as UpdateParticipants from './patch.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListParticipants.validation),
    ListParticipants.controller,
);
router.patch(
    '/:participantId',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(UpdateParticipants.validation),
    UpdateParticipants.controller,
);

export default router;
