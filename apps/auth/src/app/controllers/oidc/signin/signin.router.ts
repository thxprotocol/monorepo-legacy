import express, { urlencoded } from 'express';
import { assertInput, assertInteraction } from '@thxnetwork/auth/middlewares';
import CeateResendOtp from './resend-otp/post';
import ReadOtp from './otp/get';
import CreateOtp from './otp/post';
import ReadSignin from './get';
import CreateSignin from './post';

const router = express.Router();

router.get('/', assertInteraction, ReadSignin.controller);
router.get('/otp', assertInteraction, ReadOtp.controller);
router.post(
    '/',
    urlencoded({ extended: false }),
    assertInteraction,
    assertInput(CreateSignin.validation),
    CreateSignin.controller,
);
router.post(
    '/otp',
    urlencoded({ extended: false }),
    assertInteraction,
    assertInput(CreateOtp.validation),
    CreateOtp.controller,
);
router.post('/resend-otp', urlencoded({ extended: false }), assertInteraction, CeateResendOtp.controller);

export default router;
