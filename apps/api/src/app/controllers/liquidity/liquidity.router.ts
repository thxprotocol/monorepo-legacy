import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

import ListController from './list.controller';
import ListPriceController from './price/list.controller';
import CreateLiquidityController from './post.controller';
import CreateLiquidityStakedController from './stake/post.controller';

const router = express.Router();

router.get('/', assertRequestInput(ListController.validation), ListController.controller);
router.post('/', assertRequestInput(CreateLiquidityController.validation), CreateLiquidityController.controller);
router.get('/price', ListPriceController.controller);
router.post(
    '/stake',
    assertRequestInput(CreateLiquidityStakedController.validation),
    CreateLiquidityStakedController.controller,
);

export default router;
