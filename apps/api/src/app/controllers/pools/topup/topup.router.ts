import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import CreateController from './post.controller';

const router = express.Router({ mergeParams: true });

router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);

export default router;
