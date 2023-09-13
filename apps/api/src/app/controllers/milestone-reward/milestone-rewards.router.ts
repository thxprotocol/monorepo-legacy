import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListMilestoneRewards from './list.controller';
import ReadMilestoneRewards from './get.controller';
import CreateMilestoneRewards from './post.controller';
import DeleteMilestoneRewards from './delete.controller';
import UpdateMilestoneRewards from './patch.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get('/', assertPoolAccess, ListMilestoneRewards.controller);
router.get(
    '/:id',
    guard.check(['custom_rewards:write', 'custom_rewards:read']),
    assertRequestInput(ReadMilestoneRewards.validation),
    assertPoolAccess,
    ReadMilestoneRewards.controller,
);
router.post(
    '/',
    upload.single('file'),
    assertRequestInput(CreateMilestoneRewards.validation),
    assertPoolAccess,
    CreateMilestoneRewards.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    assertRequestInput(UpdateMilestoneRewards.validation),
    assertPoolAccess,
    UpdateMilestoneRewards.controller,
);
router.delete(
    '/:id',
    assertRequestInput(DeleteMilestoneRewards.validation),
    assertPoolAccess,
    DeleteMilestoneRewards.controller,
);

export default router;
