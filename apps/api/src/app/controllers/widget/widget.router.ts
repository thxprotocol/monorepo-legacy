import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import ReadWidget from './get.controller';
import ReadWidgetScript from './js/get.controller';

const router = express.Router();

router.get('/:id.:ext', assertRequestInput(ReadWidgetScript.validation), ReadWidgetScript.controller);
router.get('/:id', assertRequestInput(ReadWidget.validation), ReadWidget.controller);

export default router;
