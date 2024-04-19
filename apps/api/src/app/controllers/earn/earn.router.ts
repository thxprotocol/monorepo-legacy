import express from 'express';
import ListPriceController from './prices/list.controller';
import ListAPRController from './metrics/list.controller';

const router = express.Router();

router.get('/prices', ListPriceController.controller);
router.get('/metrics', ListAPRController.controller);

export default router;
