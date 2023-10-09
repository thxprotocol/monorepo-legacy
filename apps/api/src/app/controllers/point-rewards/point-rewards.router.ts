import express from 'express';
import ListPointRewards from './list.controller';
import ReadPointRewards from './get.controller';
import CreatePointRewards from './post.controller';
import DeletePointRewards from './delete.controller';
import UpdatePointRewards from './patch.controller';
import ListPointRewardEntries from './entries/list.controller';
import { upload } from '@thxnetwork/api/util/multer';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { assertPoolAccess, assertQuestAccess, assertRequestInput } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.get('/', assertPoolAccess, ListPointRewards.controller);
router.get(
    '/:id',
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Twitter),
    assertRequestInput(ReadPointRewards.validation),
    ReadPointRewards.controller,
);
router.post(
    '/',
    upload.single('file'),
    assertRequestInput(CreatePointRewards.validation),
    assertPoolAccess,
    CreatePointRewards.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Twitter),
    assertRequestInput(UpdatePointRewards.validation),
    UpdatePointRewards.controller,
);
router.delete(
    '/:id',
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Twitter),
    assertRequestInput(DeletePointRewards.validation),
    DeletePointRewards.controller,
);

router.get(
    '/:id/entries',
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Twitter),
    assertRequestInput(ListPointRewardEntries.validation),
    ListPointRewardEntries.controller,
);

export default router;
