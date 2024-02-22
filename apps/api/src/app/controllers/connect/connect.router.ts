import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import CreateWalletConnect from './post.controller';

const router = express.Router();

router.post('/', assertRequestInput(CreateWalletConnect.validation), CreateWalletConnect.controller);

export default router;
