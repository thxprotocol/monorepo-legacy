import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

import GetBrand from './get.controller';
import PutBrand from './put.controller';

const router = express.Router();
router.get('/', guard.check(['brands:read']), GetBrand.controller);
router.put(
    '/',
    guard.check(['brands:write', 'brands:read']),
    assertRequestInput(PutBrand.validation),
    PutBrand.controller,
);

export default router;
