import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import * as CreatePayments from './post.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(CreatePayments.validation),
    CreatePayments.controller,
);

export default router;
