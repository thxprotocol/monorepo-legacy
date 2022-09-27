import express from 'express';

import ReadTokenCirculatingSupply from './cs/get.controller';
import ReadTokenTotalSupply from './ts/get.controller';

const router = express.Router();

router.get('/cs', ReadTokenCirculatingSupply.controller);
router.get('/ts', ReadTokenTotalSupply.controller);

export default router;
