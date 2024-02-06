import express from 'express';
import Read from './get.controller';

const router = express.Router({ mergeParams: true });

router.get('/:kind', Read.controller);

export default router;
