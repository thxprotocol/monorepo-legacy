import multer from 'multer';
import express, { urlencoded } from 'express';
import ReadOIDC from './get';
import ReadAbort from './abort/get';
import ReadForgot from './forgot/get';
import ReadSignin from './signin/get';
import CreateSignin from './signin/post';
import CreateSignup from './signup/post';
import ReadSignup from './signup/get';
import ReadClaim from './claim/get';
import ReadReset from './reset/get';
import ReadConfirm from './confirm/get';
import ReadConfirmEmail from './account/email/get';
import ReadConnect from './connect/get';
import CreatePassword from './password/post';
import CreateForgot from './forgot/post';
import CreateReset from './reset/post';
import ReadCallbackGoogle from './callback/google/get.controller';
import ReadCallbackTwitter from './callback/twitter/get.controller';
import ReadCallbackSpotify from './callback/spotify/get.controller';
import ReadAccount from './account/get';
import UpdateAccount from './account/post';
import UpdateAccountTOTP from './account/totp/post';
import ReadAccountTOTP from './account/totp/get';
import PostGoogleDisconnect from './account/google/disconnect/post.controller';
import PostTwitterDisconnect from './account/twitter/disconnect/post.controller';
import PostSpotifyDisconnect from './account/spotify/disconnect/post.controller';
import ReadAccountEmailVerify from './account/email/get';
import { assertInput, assertAuthorization, assertInteraction } from '../../middlewares';

const router = express.Router();

router.get('/callback/google', ReadCallbackGoogle.controller);
router.get('/callback/twitter', ReadCallbackTwitter.controller);
router.get('/callback/spotify', ReadCallbackSpotify.controller);

// Routes require no auth
router.get('/:uid', assertInteraction, ReadOIDC.controller);
router.get('/:uid/signin', assertInteraction, ReadSignin.controller);
router.get('/:uid/signup', assertInteraction, ReadSignup.controller);
router.get('/:uid/confirm', assertInteraction, ReadConfirm.controller);
router.get('/:uid/confirm/email', assertInteraction, ReadConfirmEmail.controller);
router.get('/:uid/reset', assertInteraction, ReadReset.controller);
router.get('/:uid/claim', assertInteraction, ReadClaim.controller);
router.post('/:uid/signin', urlencoded({ extended: false }), assertInteraction, CreateSignin.controller);
router.post('/:uid/signup', urlencoded({ extended: false }), assertInteraction, CreateSignup.controller);
router.post('/:uid/password', urlencoded({ extended: false }), assertInteraction, CreatePassword.controller);
router.get('/:uid/abort', assertInteraction, ReadAbort.controller);
router.get('/:uid/forgot', assertInteraction, ReadForgot.controller);
router.post('/:uid/forgot', urlencoded({ extended: false }), assertInteraction, CreateForgot.controller);
router.post('/:uid/reset', urlencoded({ extended: false }), assertInteraction, CreateReset.controller);

const upload = multer();

// // Routes require auth
router.get('/:uid/connect', assertInteraction, assertAuthorization, ReadConnect.controller);
router.get('/:uid/account', assertInteraction, assertAuthorization, ReadAccount.controller);

router.post('/:uid/account/google/disconnect', assertInteraction, assertAuthorization, PostGoogleDisconnect.controller);
router.post(
    '/:uid/account/spotify/disconnect',
    assertInteraction,
    assertAuthorization,
    PostSpotifyDisconnect.controller,
);
router.post(
    '/:uid/account/twitter/disconnect',
    assertInteraction,
    assertAuthorization,
    PostTwitterDisconnect.controller,
);

router.post(
    '/:uid/account',
    urlencoded({ extended: false }),
    upload.fields([{ name: 'profile', maxCount: 1 }]),
    assertInteraction,
    assertAuthorization,
    assertInput(UpdateAccount.validation),
    UpdateAccount.controller,
);

router.get('/:uid/account/totp', assertInteraction, assertAuthorization, ReadAccountTOTP.controller);
router.post(
    '/:uid/account/totp',
    urlencoded({ extended: false }),
    assertInteraction,
    assertAuthorization,
    assertInput(UpdateAccountTOTP.validation),
    UpdateAccountTOTP.controller,
);
router.get('/:uid/account/email/verify', assertInteraction, assertAuthorization, ReadAccountEmailVerify.controller);

export default router;
