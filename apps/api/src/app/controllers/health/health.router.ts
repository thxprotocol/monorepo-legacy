import express from 'express';
import ListController from './list.controller';

const router = express.Router();

router.get('/', ListController.controller);

export default router;
