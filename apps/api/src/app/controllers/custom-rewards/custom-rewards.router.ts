import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListCustomReward from './list.controller';
import CreateCustomReward from './post.controller';
import UpdateCustomReward from './patch.controller';
import RemoveCustomReward from './delete.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get(
    '/',
    guard.check(['custom_rewards:read']),
    assertPoolAccess,
    assertRequestInput(ListCustomReward.validation),
    ListCustomReward.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['custom_rewards:write', 'custom_rewards:read']),
    assertPoolAccess,
    assertRequestInput(UpdateCustomReward.validation),
    UpdateCustomReward.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['custom_rewards:write', 'custom_rewards:read']),
    assertPoolAccess,
    assertRequestInput(CreateCustomReward.validation),
    CreateCustomReward.controller,
);
router.delete(
    '/:id',
    guard.check(['custom_rewards:write']),
    assertPoolAccess,
    assertRequestInput(RemoveCustomReward.validation),
    RemoveCustomReward.controller,
);

export default router;
