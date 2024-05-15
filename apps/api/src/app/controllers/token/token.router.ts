import express, { Router } from 'express';

import * as ReadTokenCirculatingSupply from './cs/get.controller';
import * as ReadTokenTotalSupply from './ts/get.controller';

const router: express.Router = express.Router();

router.get('/cs', ReadTokenCirculatingSupply.controller);
router.get('/ts', ReadTokenTotalSupply.controller);

export default router;
