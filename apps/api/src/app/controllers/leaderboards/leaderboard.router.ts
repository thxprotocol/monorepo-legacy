import express from 'express';
import ReadLeaderboard from './get.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

export const router = express.Router();

router.get('/:id', assertRequestInput(ReadLeaderboard.validation), ReadLeaderboard.controller);

export default router;
