import express from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateRewardCoin from './post.controller';
import ReadRewardCoin from './get.controller';
import UpdateRewardCoin from './patch.controller';
import ListRewardCoin from './list.controller';
import DeleteRewardCoin from './delete.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get('/', guard.check(['erc20_rewards:read']), assertPoolAccess, ListRewardCoin.controller);
router.get(
    '/:id',
    guard.check(['erc20_rewards:read']),
    assertPoolAccess,
    assertRequestInput(ReadRewardCoin.validation),
    ReadRewardCoin.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertPoolAccess,
    assertRequestInput(CreateRewardCoin.validation),
    CreateRewardCoin.controller,
);

router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertPoolAccess,
    assertRequestInput(UpdateRewardCoin.validation),
    UpdateRewardCoin.controller,
);

router.delete(
    '/:id',
    guard.check(['erc20_rewards:write', 'erc20_rewards:read']),
    assertPoolAccess,
    assertRequestInput(DeleteRewardCoin.validation),
    DeleteRewardCoin.controller,
);

export default router;
