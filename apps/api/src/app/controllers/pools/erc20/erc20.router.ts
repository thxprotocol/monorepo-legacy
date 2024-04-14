import express from 'express';
import RouterBalance from './balance/balance.router';
import RouterAllowance from './allowance/allowance.router';

const router = express.Router({ mergeParams: true });

router.use('/balance', RouterBalance);
router.use('/allowance', RouterAllowance);

export default router;
