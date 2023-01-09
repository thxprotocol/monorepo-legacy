import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import QualifyReward from './referral/qualify/post.controller';

const router = express.Router();

router.post('/referral/:token/qualify', assertRequestInput(QualifyReward.validation), QualifyReward.controller);

router.post('/milestones/:token/claim')

export default router;
