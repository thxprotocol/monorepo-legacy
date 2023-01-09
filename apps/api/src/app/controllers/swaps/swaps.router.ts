import express from 'express';
import CreateERC20Swap from './post.controller';
import ReadERC20Swap from './get.controller';
import ListERC20Swaps from './list.controller';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.get('/', guard.check(['swap:read']), ListERC20Swaps.controller);
router.get('/:id', guard.check(['swap:read']), assertRequestInput(ReadERC20Swap.validation), ReadERC20Swap.controller);
router.post(
    '/',
    guard.check(['swap:write', 'swap:read']),
    assertRequestInput(CreateERC20Swap.validation),
    CreateERC20Swap.controller,
);

export default router;
