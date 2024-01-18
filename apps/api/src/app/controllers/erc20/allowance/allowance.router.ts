import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateController from './get.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['erc20:read']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);

export default router;
