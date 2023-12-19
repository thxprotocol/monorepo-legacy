import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import QualifyReward from './referral/qualify/post.controller';
import MilestoneReward from './milestones/claim/post.controller';
import DailyReward from './daily/post.controller';

const router = express.Router();

// Deprecate soon
router.post('/milestone/:eventName/claim', assertRequestInput(MilestoneReward.validation), MilestoneReward.controller);
router.post('/daily/:eventName', assertRequestInput(DailyReward.validation), DailyReward.controller);

router.post('/referral/:token/qualify', assertRequestInput(QualifyReward.validation), QualifyReward.controller);

export default router;
