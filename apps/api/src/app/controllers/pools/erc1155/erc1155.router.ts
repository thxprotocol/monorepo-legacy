import express from 'express';
import RouterBalance from './balance/balance.router';

const router = express.Router({ mergeParams: true });

router.use('/balance', RouterBalance);

export default router;
