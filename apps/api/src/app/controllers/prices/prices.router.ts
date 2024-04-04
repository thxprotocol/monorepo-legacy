import express from 'express';
import ListPriceController from './list.controller';

const router = express.Router();

router.get('/', ListPriceController.controller);

export default router;
