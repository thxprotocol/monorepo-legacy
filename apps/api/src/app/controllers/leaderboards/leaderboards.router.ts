import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import ListLeaderboard from './list.controller';
import ReadLeaderboard from './get.controller';

export const router = express.Router();

router.get('/', assertRequestInput(ListLeaderboard.validation), ListLeaderboard.controller);
router.get('/:campaignId', assertRequestInput(ReadLeaderboard.validation), ReadLeaderboard.controller);

export default router;
