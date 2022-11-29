import express from 'express';
import ReadWidgetRewards from './get.controller';

const router = express.Router();

router.get('/inject.js', ReadWidgetRewards.controller);

export default router;
