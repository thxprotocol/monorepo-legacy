import multer from 'multer';
import express, { urlencoded } from 'express';
import ReadOIDC from './get';
import CeateResendOtp from './signin/resend-otp/post';
import ReadOtp from './signin/otp/get';
import CreateOtp from './signin/otp/post';
import ReadAbort from './abort/get';
import ReadSignin from './signin/get';
import CreateSignin from './signin/post';
import ReadConnect from './connect/get';
import ReadCallbackGoogle from './callback/google/get.controller';
import ReadCallbackTwitter from './callback/twitter/get.controller';
import ReadCallbackDiscord from './callback/discord/get.controller';
import ReadCallbackGithub from './callback/github/get.controller';
import ReadCallbackTwitch from './callback/twitch/get.controller';
import ReadAccount from './account/get';
import UpdateAccount from './account/post';
import ReadAccountEmailVerify from './account/email/get';
import { assertInput, assertAuthorization, assertInteraction } from '../../middlewares';

const router = express.Router();

router.get('/callback/google', ReadCallbackGoogle.controller);
router.get('/callback/twitter', ReadCallbackTwitter.controller);
router.get('/callback/github', ReadCallbackGithub.controller);
router.get('/callback/discord', ReadCallbackDiscord.controller);
router.get('/callback/twitch', ReadCallbackTwitch.controller);

// Routes require no auth
router.get('/:uid', assertInteraction, ReadOIDC.controller);
router.get('/:uid/signin', assertInteraction, ReadSignin.controller);
router.get('/:uid/signin/otp', assertInteraction, ReadOtp.controller);
router.post(
    '/:uid/signin/otp',
    urlencoded({ extended: false }),
    assertInteraction,
    assertInput(CreateOtp.validation),
    CreateOtp.controller,
);
router.post(
    '/:uid/signin',
    urlencoded({ extended: false }),
    assertInteraction,
    assertInput(CreateSignin.validation),
    CreateSignin.controller,
);
router.post('/:uid/signin/resend-otp', urlencoded({ extended: false }), assertInteraction, CeateResendOtp.controller);
router.get('/:uid/abort', assertInteraction, ReadAbort.controller);

const upload = multer();

// // Routes require auth
router.get('/:uid/connect', assertInteraction, assertAuthorization, ReadConnect.controller);
router.get('/:uid/account', assertInteraction, assertAuthorization, ReadAccount.controller);

router.post(
    '/:uid/account',
    urlencoded({ extended: false }),
    upload.fields([{ name: 'profile', maxCount: 1 }]),
    assertInteraction,
    assertAuthorization,
    assertInput(UpdateAccount.validation),
    UpdateAccount.controller,
);

router.get('/:uid/account/email/verify', assertInteraction, assertAuthorization, ReadAccountEmailVerify.controller);

export default router;
