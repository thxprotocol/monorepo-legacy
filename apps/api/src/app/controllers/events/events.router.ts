import express from 'express';
import * as CreateEvents from './post.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router();

router.post('/', guard.check(['events:write']), assertRequestInput(CreateEvents.validation), CreateEvents.controller);

export default router;
