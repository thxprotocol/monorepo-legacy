import express from 'express';
import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import ReadMerchant from './get.controller';
import CreateMerchant from './post.controller';
import CreateMerchantLink from './link/post.controller';
import CreateMerchantPayment from './payments/post.controller';

const router = express.Router();

router.post(
    '/payments',
    // guard.check('merchant:write'),
    // assertRequestInput(CreateMerchantPayment.validation),
    CreateMerchantPayment.controller,
);

router.use(checkJwt).use(corsHandler).post(
    '/link',
    // guard.check('merchant:write'),
    assertRequestInput(CreateMerchantLink.validation),
    CreateMerchantLink.controller,
);

router.use(checkJwt).use(corsHandler).get(
    '/',
    // guard.check('merchant:write'),
    // assertRequestInput(ReadMerchant.validation),
    ReadMerchant.controller,
);

router.use(checkJwt).use(corsHandler).post(
    '/',
    // guard.check('merchant:write'),
    assertRequestInput(CreateMerchant.validation),
    CreateMerchant.controller,
);
export default router;
