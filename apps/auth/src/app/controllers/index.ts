import express, { json, urlencoded } from 'express';
import oidcRouter from './oidc/oidc.router';
import accountRouter from './account/account.router';
import healthRouter from './health/_.routing';
import { oidc } from '../util/oidc';
import { getAction } from './get.action';

export const mainRouter = express.Router();

mainRouter.get('/', getAction);
mainRouter.use('/oidc', oidcRouter);
mainRouter.use('/account', json(), urlencoded({ extended: true }), accountRouter);
mainRouter.use('/health', json(), urlencoded({ extended: true }), healthRouter);
mainRouter.use('/', oidc.callback());
