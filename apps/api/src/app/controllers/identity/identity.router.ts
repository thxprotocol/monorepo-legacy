import express from 'express';
import CreateIdentity from './post.controller';
import UpdateIdentity from './patch.controller';
import { checkJwt, corsHandler, assertRequestInput } from '@thxnetwork/api/middlewares';

const router = express.Router();

router
    .use(checkJwt)
    .use(corsHandler)
    .patch('/:uuid', assertRequestInput(UpdateIdentity.validation), UpdateIdentity.controller);

router
    .use(checkJwt)
    .use(corsHandler)
    .post('/', assertRequestInput(CreateIdentity.validation), CreateIdentity.controller);

export default router;
