import { assertPoolAccess, assertQuestAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListDailyRewards from './list.controller';
import ReadDailyRewards from './get.controller';
import CreateDailyRewards from './post.controller';
import DeleteDailyRewards from './delete.controller';
import UpdateDailyRewards from './patch.controller';
import { upload } from '@thxnetwork/api/util/multer';
import { QuestVariant } from '@thxnetwork/types/enums';

const router = express.Router();

router.get('/', assertPoolAccess, ListDailyRewards.controller);
router.get(
    '/:id',
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Daily),
    assertRequestInput(ReadDailyRewards.validation),
    ReadDailyRewards.controller,
);
router.post(
    '/',
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(CreateDailyRewards.validation),
    CreateDailyRewards.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Daily),
    assertRequestInput(UpdateDailyRewards.validation),
    UpdateDailyRewards.controller,
);
router.delete(
    '/:id',
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Daily),
    assertRequestInput(DeleteDailyRewards.validation),
    DeleteDailyRewards.controller,
);

export default router;
