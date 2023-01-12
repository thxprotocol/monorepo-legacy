import { assertAssetPoolAccess, assertRequestInput, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListMilestoneRewards from './list.controller';
import ReadMilestoneRewards from './get.controller';
import CreateMilestoneRewards from './post.controller';
import DeleteMilestoneRewards from './delete.controller';
import UpdateMilestoneRewards from './patch.controller';

const router = express.Router();

router.get('/', assertAssetPoolAccess, requireAssetPoolHeader, ListMilestoneRewards.controller);
router.get(
    '/:id',
    assertRequestInput(ReadMilestoneRewards.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    ReadMilestoneRewards.controller,
);
router.post(
    '/',
    assertRequestInput(CreateMilestoneRewards.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    CreateMilestoneRewards.controller,
);
router.patch(
    '/:id',
    assertRequestInput(UpdateMilestoneRewards.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    UpdateMilestoneRewards.controller,
);
router.delete(
    '/:id',
    assertRequestInput(DeleteMilestoneRewards.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    DeleteMilestoneRewards.controller,
);

export default router;
