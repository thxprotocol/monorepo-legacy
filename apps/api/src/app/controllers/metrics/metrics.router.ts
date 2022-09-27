import express from 'express';
import ListMetrics from './get.controller';

const router = express.Router();

router.get('/', ListMetrics.controller);

export default router;
