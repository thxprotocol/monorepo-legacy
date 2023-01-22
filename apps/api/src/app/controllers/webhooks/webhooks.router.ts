import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import QualifyReward from './referral/qualify/post.controller';
import MilestoneReward from './milestones/claim/post.controller';

const router = express.Router();

router.post('/referral/:token/qualify', assertRequestInput(QualifyReward.validation), QualifyReward.controller);
router.post('/milestone/:token/claim', assertRequestInput(MilestoneReward.validation), MilestoneReward.controller);

export default router;
