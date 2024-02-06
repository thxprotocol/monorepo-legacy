import express, { urlencoded } from 'express';
import { assertInput, assertInteraction } from '@thxnetwork/auth/middlewares';
import ReadOTP from './otp/get';
import CreateOTP from './otp/post';
import Read from './get';
import Create from './post';
import CreateORPRetry from './retry/post';

const router = express.Router({ mergeParams: true });

router.get('/', assertInteraction, Read.controller);
router.get('/otp', assertInteraction, ReadOTP.controller);
router.post('/', urlencoded({ extended: false }), assertInteraction, assertInput(Create.validation), Create.controller);
router.post(
    '/otp',
    urlencoded({ extended: false }),
    assertInteraction,
    assertInput(CreateOTP.validation),
    CreateOTP.controller,
);
router.post('/resend-otp', urlencoded({ extended: false }), assertInteraction, CreateORPRetry.controller);

export default router;
