import express from 'express';
import ReadController from './get.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.get(
    '/:id',
    guard.check([
        // 'jobs:read'
    ]),
    assertRequestInput(ReadController.validation),
    ReadController.controller,
);

export default router;
