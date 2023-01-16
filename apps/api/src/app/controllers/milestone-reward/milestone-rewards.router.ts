import { assertRequestInput, assertAssetPoolOwnership } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListMilestoneRewards from './list.controller';
import ReadMilestoneRewards from './get.controller';
import CreateMilestoneRewards from './post.controller';
import DeleteMilestoneRewards from './delete.controller';
import UpdateMilestoneRewards from './patch.controller';

const router = express.Router();

router.get('/', assertAssetPoolOwnership, ListMilestoneRewards.controller);
router.get(
    '/:id',
    assertRequestInput(ReadMilestoneRewards.validation),
    assertAssetPoolOwnership,
    ReadMilestoneRewards.controller,
);
router.post(
    '/',
    assertRequestInput(CreateMilestoneRewards.validation),
    assertAssetPoolOwnership,
    CreateMilestoneRewards.controller,
);
router.patch(
    '/:id',
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
