import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import ReadController from './get.controller';

const router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(ReadController.validation),
    ReadController.controller,
);

export default router;
