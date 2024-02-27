import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import ListController from './list.controller';

const router = express.Router({ mergeParams: true });

router.get(
    '/:variant',
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListController.validation),
    ListController.controller,
);

export default router;
