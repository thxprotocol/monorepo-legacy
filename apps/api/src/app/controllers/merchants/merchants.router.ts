import express from 'express';
import { assertRequestInput, checkJwt, corsHandler, guard } from '@thxnetwork/api/middlewares';
import ReadMerchant from './get.controller';
import CreateMerchant from './post.controller';
import CreateMerchantLink from './link/post.controller';
import CreateMerchantPayment from './payments/post.controller';
import DeleteMerchant from './delete.controller';

const router = express.Router();

router.post('/payments', guard.check('merchants:write'), CreateMerchantPayment.controller);
router
    .use(checkJwt)
    .use(corsHandler)
    .post(
        '/link',
        guard.check('merchants:write'),
        assertRequestInput(CreateMerchantLink.validation),
        CreateMerchantLink.controller,
    );
router.use(checkJwt).use(corsHandler).get('/', guard.check('merchants:write'), ReadMerchant.controller);
router.use(checkJwt).use(corsHandler).delete('/', guard.check('merchants:write'), DeleteMerchant.controller);
router
    .use(checkJwt)
    .use(corsHandler)
    .post('/', guard.check('merchant:write'), assertRequestInput(CreateMerchant.validation), CreateMerchant.controller);

export default router;
