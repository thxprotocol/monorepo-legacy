import express from 'express';
import { getHealth } from './get.controller';

const router = express.Router();

router.get('/', getHealth);

export default router;
