import { assertPoolAccess, assertQuestAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListWeb3Quest from './list.controller';
import CreateWeb3Quest from './post.controller';
import UpdateWeb3Quest from './patch.controller';
import RemoveWeb3Quest from './delete.controller';
import { upload } from '@thxnetwork/api/util/multer';
import { QuestVariant } from '@thxnetwork/types/enums';

const router = express.Router();

router.get(
    '/',
    guard.check(['web3_quests:read']),
    assertPoolAccess,
    assertRequestInput(ListWeb3Quest.validation),
    ListWeb3Quest.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['web3_quests:write', 'web3_quests:read']),
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Web3),
    assertRequestInput(UpdateWeb3Quest.validation),
    UpdateWeb3Quest.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['web3_quests:write', 'web3_quests:read']),
    assertPoolAccess,
    assertRequestInput(CreateWeb3Quest.validation),
    CreateWeb3Quest.controller,
);
router.delete(
    '/:id',
    guard.check(['web3_quests:write']),
    assertPoolAccess,
    assertQuestAccess(QuestVariant.Web3),
    assertRequestInput(RemoveWeb3Quest.validation),
    RemoveWeb3Quest.controller,
);

export default router;
