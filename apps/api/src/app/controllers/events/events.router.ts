import express from 'express';
import ListEvents from './list.controller';
import CreateEvents from './post.controller';
import { assertPoolAccess, assertRequestInput, checkJwt, corsHandler, guard } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.post('/', assertRequestInput(CreateEvents.validation), CreateEvents.controller);

router
    .use(checkJwt)
    .use(corsHandler)
    .get('/', guard.check(['pool:read']), assertPoolAccess, ListEvents.controller);

export default router;
