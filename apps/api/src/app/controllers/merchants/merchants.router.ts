import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import CreateMerchant from './post.controller';

const router = express.Router();

router.post(
    '/',
    // guard.check('merchant:write'),
    assertRequestInput(CreateMerchant.validation),
    CreateMerchant.controller,
);

export default router;
