import { assertRequestInput, assertAssetPoolOwnership, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListMilestoneRewards from './list.controller';
import ReadMilestoneRewards from './get.controller';
import CreateMilestoneRewards from './post.controller';
import DeleteMilestoneRewards from './delete.controller';
import UpdateMilestoneRewards from './patch.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get('/', assertAssetPoolOwnership, ListMilestoneRewards.controller);
router.get(
    '/:id',
    guard.check(['custom_rewards:write', 'custom_rewards:read']),
    assertRequestInput(ReadMilestoneRewards.validation),
    assertAssetPoolOwnership,
    ReadMilestoneRewards.controller,
);
router.post(
    '/',
    upload.single('file'),
    assertRequestInput(CreateMilestoneRewards.validation),
    assertAssetPoolOwnership,
    CreateMilestoneRewards.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    assertRequestInput(UpdateMilestoneRewards.validation),
    assertAssetPoolOwnership,
    UpdateMilestoneRewards.controller,
);
router.delete(
    '/:id',
    assertRequestInput(DeleteMilestoneRewards.validation),
    assertAssetPoolOwnership,
    DeleteMilestoneRewards.controller,
);

export default router;
