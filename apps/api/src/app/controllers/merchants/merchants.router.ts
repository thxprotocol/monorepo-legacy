import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import CreateMerchant from './post.controller';
import CreateMerchantLink from './link/post.controller';

const router = express.Router();

router.post(
    '/link',
    // guard.check('merchant:write'),
    assertRequestInput(CreateMerchantLink.validation),
    CreateMerchantLink.controller,
);

router.post(
    '/',
    // guard.check('merchant:write'),
    assertRequestInput(CreateMerchant.validation),
    CreateMerchant.controller,
);

export default router;
