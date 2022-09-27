import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadMembership from './get.controller';
import DeleteMembership from './delete.controller';
import ListMemberships from './list.controller';

const router = express.Router();

router.get('/', guard.check(['memberships:read']), ListMemberships.controller);
router.get(
    '/:id',
    guard.check(['memberships:read']),
    assertRequestInput(ReadMembership.validation),
    ReadMembership.controller,
);
router.delete(
    '/:id',
    guard.check(['memberships:write']),
    assertRequestInput(DeleteMembership.validation),
    DeleteMembership.controller,
);

export default router;
