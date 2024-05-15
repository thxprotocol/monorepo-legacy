import express from 'express';
import * as ListHealth from './list.controller';

const router: express.Router = express.Router();

router.get('/', ListHealth.controller);

export default router;
