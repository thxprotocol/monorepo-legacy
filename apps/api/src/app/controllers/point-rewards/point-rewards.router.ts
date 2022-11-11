import express from 'express';
import ListPointRewards from './list.controller';

const router = express.Router();

router.get('/', ListPointRewards.controller);

export default router;
