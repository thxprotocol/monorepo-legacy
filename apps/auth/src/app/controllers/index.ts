import express, { json, urlencoded } from 'express';
import { oidc } from '../util/oidc';
import Root from './get.controller';
import RouterOIDC from './oidc/oidc.router';
import RouterMe from './me/me.router';
import RouterAccounts from './account/account.router';
import RouterHealth from './health/health.router';

export const router = express.Router();

router.get('/', Root.controller);
router.use('/oidc', RouterOIDC);
router.use('/me', json(), urlencoded({ extended: true }), RouterMe);
router.use('/accounts', json(), urlencoded({ extended: true }), RouterAccounts);
router.use('/health', json(), urlencoded({ extended: true }), RouterHealth);
router.use('/', oidc.callback());

export default router;
