import { assertRequestInput, assertPoolAccess, assertQuestAccess } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListMilestoneRewards from './list.controller';
import ReadMilestoneRewards from './get.controller';
import CreateMilestoneRewards from './post.controller';
import DeleteMilestoneRewards from './delete.controller';
import UpdateMilestoneRewards from './patch.controller';
import { upload } from '@thxnetwork/api/util/multer';
import { QuestVariant } from '@thxnetwork/types/enums';

const router = express.Router();

router.get('/', assertPoolAccess, ListMilestoneRewards.controller);
router.get(
    '/:id',
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Custom),
    assertRequestInput(ReadMilestoneRewards.validation),
    ReadMilestoneRewards.controller,
);
router.post(
    '/',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(CreateMilestoneRewards.validation),
    CreateMilestoneRewards.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Custom),
    assertRequestInput(UpdateMilestoneRewards.validation),
    UpdateMilestoneRewards.controller,
);
router.delete(
    '/:id',
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Custom),
    assertRequestInput(DeleteMilestoneRewards.validation),
    DeleteMilestoneRewards.controller,
);

export default router;
