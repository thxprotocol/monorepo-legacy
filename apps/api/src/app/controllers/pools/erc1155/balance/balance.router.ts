import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadController from './get.controller';

const router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['erc1155:read']),
    assertRequestInput(ReadController.validation),
    ReadController.controller,
);

export default router;
