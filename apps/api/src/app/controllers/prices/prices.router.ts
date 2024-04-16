import express from 'express';
import ListPriceController from './list.controller';
import ListAPRController from './apr/list.controller';

const router = express.Router();

router.get('/', ListPriceController.controller);
router.get('/apr', ListAPRController.controller);

export default router;
