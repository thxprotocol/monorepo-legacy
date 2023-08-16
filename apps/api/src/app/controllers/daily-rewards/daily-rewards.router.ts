import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListDailyRewards from './list.controller';
import ReadDailyRewards from './get.controller';
import CreateDailyRewards from './post.controller';
import DeleteDailyRewards from './delete.controller';
import UpdateDailyRewards from './patch.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

// TODO Migrate to using the correct scope here

router.get('/', guard.check(['custom_rewards:read']), assertAssetPoolOwnership, ListDailyRewards.controller);
router.get(
    '/:id',
    guard.check(['custom_rewards:read']),
    assertRequestInput(ReadDailyRewards.validation),
    assertAssetPoolOwnership,
    ReadDailyRewards.controller,
);
router.post(
    '/',
    guard.check(['custom_rewards:write', 'custom_rewards:read']),
    upload.single('file'),
    assertRequestInput(CreateDailyRewards.validation),
    assertAssetPoolOwnership,
    CreateDailyRewards.controller,
);
router.patch(
    '/:id',
    guard.check(['custom_rewards:write', 'custom_rewards:read']),
    upload.single('file'),
    assertRequestInput(UpdateDailyRewards.validation),
    assertAssetPoolOwnership,
    UpdateDailyRewards.controller,
);
router.delete(
    '/:id',
    guard.check(['custom_rewards:write']),
    assertRequestInput(DeleteDailyRewards.validation),
    assertAssetPoolOwnership,
    DeleteDailyRewards.controller,
);

export default router;
