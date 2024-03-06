import express, { json, urlencoded } from 'express';
import rateLimit from 'express-rate-limit';
import { oidc } from '../util/oidc';
import Root from './get.controller';
import RouterOIDC from './oidc/oidc.router';
import RouterMe from './me/me.router';
import RouterAccounts from './account/account.router';
import RouterHealth from './health/health.router';

export const router = express.Router();

// Rate limit these public endpoints to max 10 req per minute
const rateLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

// Rate limit these public endpoints to max 10 req per minute
router.get('/', rateLimiter, Root.controller);
router.use('/health', rateLimiter, json(), urlencoded({ extended: true }), RouterHealth);
router.use('/me', rateLimiter, json(), urlencoded({ extended: true }), RouterMe);
router.use('/oidc', rateLimiter, RouterOIDC);
router.use('/accounts', json(), urlencoded({ extended: true }), RouterAccounts);
router.use('/', oidc.callback());

export default router;
