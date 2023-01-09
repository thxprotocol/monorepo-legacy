import express from 'express';
import CreateERC20SwapRule from './post.controller';
import ReadERC20SwapRule from './get.controller';
import ListERC20SwapRules from './list.controller';
import { assertRequestInput, assertAssetPoolOwnership, guard } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.get(
    '/',
    guard.check(['swaprule:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ListERC20SwapRules.validation),
    ListERC20SwapRules.controller,
);
router.get(
    '/:id',
    guard.check(['swaprule:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ReadERC20SwapRule.validation),
    ReadERC20SwapRule.controller,
);
router.post(
    '/',
    guard.check(['swaprule:write', 'swaprule:read']),
    assertAssetPoolOwnership,
    assertRequestInput(CreateERC20SwapRule.validation),
    CreateERC20SwapRule.controller,
);

export default router;
