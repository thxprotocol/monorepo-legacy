import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadController from './get.controller';

const router = express.Router();

router.get('/', guard.check(['erc20:read']), assertRequestInput(ReadController.validation), ReadController.controller);

export default router;
