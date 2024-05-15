import express from 'express';
import * as ReadJobs from './get.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router();

router.get(
    '/:id',
    guard.check([
        // 'jobs:read'
    ]),
    assertRequestInput(ReadJobs.validation),
    ReadJobs.controller,
);

export default router;
