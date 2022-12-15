import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import ReadWidgetRewards from './get.controller';

const router = express.Router();

router.get('/:id.js', assertRequestInput(ReadWidgetRewards.validation), ReadWidgetRewards.controller);

export default router;
