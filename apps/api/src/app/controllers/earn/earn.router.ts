import express from 'express';
import * as ListPriceController from './prices/list.controller';
import * as ListAPRController from './metrics/list.controller';

const router: express.Router = express.Router();

router.get('/prices', ListPriceController.controller);
router.get('/metrics', ListAPRController.controller);

export default router;
