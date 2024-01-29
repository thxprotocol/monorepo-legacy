import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import List from './list.controller';
import Update from './patch.controller';

const router = express.Router({ mergeParams: true });

router.get('/', guard.check(['pools:read']), assertPoolAccess, assertRequestInput(List.validation), List.controller);
router.patch(
    '/:participantId',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(Update.validation),
    Update.controller,
);

export default router;
