import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import QualifyReward from './referral/qualify/post.controller';
import MilestoneReward from './milestones/claim/post.controller';
import DailyReward from './daily/post.controller';

const router = express.Router();

router.post('/referral/:token/qualify', assertRequestInput(QualifyReward.validation), QualifyReward.controller);
router.post('/milestone/:token/claim', assertRequestInput(MilestoneReward.validation), MilestoneReward.controller);
router.post('/daily/:token', assertRequestInput(DailyReward.validation), DailyReward.controller);
export default router;
