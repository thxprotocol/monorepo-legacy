import express from 'express';
import ListController from './list.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.get('/', assertRequestInput(ListController.validation), ListController.controller);

export default router;
