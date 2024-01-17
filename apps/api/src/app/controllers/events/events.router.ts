import express from 'express';
import CreateEvents from './post.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.post('/', guard.check(['events:write']), assertRequestInput(CreateEvents.validation), CreateEvents.controller);

export default router;
