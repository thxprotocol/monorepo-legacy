import express from 'express';
import { getHealth } from './get.action';

const router = express.Router();

router.get('/', getHealth);

export default router;
