import express from 'express';
import ListController from './list.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router = express.Router({ mergeParams: true });

router.get('/', guard.check(['pools:read']), assertRequestInput(ListController.validation), ListController.controller);

export default router;
