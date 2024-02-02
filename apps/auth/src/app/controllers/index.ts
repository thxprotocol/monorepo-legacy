import express, { json, urlencoded } from 'express';
import oidcRouter from './oidc/oidc.router';
import accountRouter from './account/account.router';
import healthRouter from './health/_.routing';
import { oidc } from '../util/oidc';
import { getAction } from './get.action';

export const mainRouter = express.Router();

mainRouter.get('/', getAction);
mainRouter.post('/testhook', json(), urlencoded({ extended: true }), (req, res) => {
    console.log(req.body);
    // res.status(403).json({ error: 'Do not do this!' });
    res.end();
});
mainRouter.use('/oidc', oidcRouter);
mainRouter.use('/accounts', json(), urlencoded({ extended: true }), accountRouter);
mainRouter.use('/health', json(), urlencoded({ extended: true }), healthRouter);
mainRouter.use('/', oidc.callback());
