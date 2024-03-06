import multer from 'multer';
import express, { urlencoded } from 'express';
import { assertInput, assertAuthorization, assertInteraction } from '../../middlewares';

import ReadConnect from './connect/get';
import CreateDisconnect from './disconnect/post.controller';
import ReadAccount from './account/get';
import UpdateAccount from './account/post';
import ReadAccountEmailVerify from './account/email/get';
import ReadOIDC from './get.controller';

import RouterCallback from './callback/callback.router';
import RouterSignin from './signin/signin.router';

const upload = multer();
const router = express.Router();

router.use('/callback', RouterCallback);
router.use('/:uid/signin', RouterSignin);

// Generic redirects from the OIDC router
router.get('/:uid', assertInteraction, ReadOIDC.controller);

// Our custom connect flow for external accounts
router.get('/:uid/connect', assertInteraction, assertAuthorization, ReadConnect.controller);
router.post('/:uid/tokens/:kind/disconnect', assertInteraction, assertAuthorization, CreateDisconnect.controller);

// @peterpolman Should deprecate and let dashboard use the /account in the API for patching account data
router.get('/:uid/account', assertInteraction, assertAuthorization, ReadAccount.controller);
router.get('/:uid/account/email/verify', assertInteraction, assertAuthorization, ReadAccountEmailVerify.controller);
router.post(
    '/:uid/account',
    urlencoded({ extended: false }),
    upload.fields([{ name: 'profile', maxCount: 1 }]),
    assertInteraction,
    assertAuthorization,
    assertInput(UpdateAccount.validation),
    UpdateAccount.controller,
);

export default router;
