import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import QualifyReward from './referral/qualify/post.controller';
import MilestoneReward from './milestones/claim/post.controller';
import DailyReward from './daily/post.controller';
import Wallet from './wallet/post.controller';
import ReadWallet from './wallet/get.controller';

const router = express.Router();

router.post('/referral/:token/qualify', assertRequestInput(QualifyReward.validation), QualifyReward.controller);
router.post('/milestone/:token/claim', assertRequestInput(MilestoneReward.validation), MilestoneReward.controller);
router.post('/daily/:token', assertRequestInput(DailyReward.validation), DailyReward.controller);
router.post('/wallet/:token', assertRequestInput(Wallet.validation), Wallet.controller);
router.get('/wallet/:token', assertRequestInput(ReadWallet.validation), ReadWallet.controller);

export default router;
