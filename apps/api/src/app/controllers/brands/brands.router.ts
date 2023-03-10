import express from 'express';
import { assertRequestInput, checkJwt, corsHandler, guard } from '@thxnetwork/api/middlewares';

import GetBrand from './get.controller';
import PutBrand from './put.controller';

const router = express.Router();
router.get('/', GetBrand.controller);

router
    .use(checkJwt)
    .use(corsHandler)
    .put(
        '/',
        guard.check(['brands:write', 'brands:read']),
        assertRequestInput(PutBrand.validation),
        PutBrand.controller,
    );

export default router;
