import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import MilestoneReward from './milestones/claim/post.controller';
import DailyReward from './daily/post.controller';
import CreateController from './gateway/post.controller';

const router = express.Router();

// Custom webhooks for Webhook Quest consumption
router.post('/gateway', assertRequestInput(CreateController.validation), CreateController.controller);

// Deprecate soon
router.post('/milestone/:uuid/claim', assertRequestInput(MilestoneReward.validation), MilestoneReward.controller);
router.post('/daily/:uuid', assertRequestInput(DailyReward.validation), DailyReward.controller);

export default router;
