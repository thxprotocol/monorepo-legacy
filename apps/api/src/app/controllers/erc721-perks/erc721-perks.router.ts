import express from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateRewardNFT from './post.controller';
import ReadRewardNFT from './get.controller';
import UpdateRewardNFT from './patch.controller';
import ListRewardNFT from './list.controller';
import DeleteRewardNFT from './delete.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get('/', guard.check(['erc721_rewards:read']), assertPoolAccess, ListRewardNFT.controller);

router.get(
    '/:id',
    guard.check(['erc721_rewards:read']),
    assertPoolAccess,
    assertRequestInput(ReadRewardNFT.validation),
    ReadRewardNFT.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertPoolAccess,
    assertRequestInput(CreateRewardNFT.validation),
    CreateRewardNFT.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertPoolAccess,
    assertRequestInput(UpdateRewardNFT.validation),
    UpdateRewardNFT.controller,
);
router.delete(
    '/:id',
    guard.check(['erc721_rewards:write', 'erc721_rewards:read']),
    assertPoolAccess,
    assertRequestInput(DeleteRewardNFT.validation),
    DeleteRewardNFT.controller,
);

export default router;
