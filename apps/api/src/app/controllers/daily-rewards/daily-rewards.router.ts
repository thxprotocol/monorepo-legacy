import { assertAssetPoolOwnership, assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListDailyRewards from './list.controller';
import ReadDailyRewards from './get.controller';
import CreateDailyRewards from './post.controller';
import DeleteDailyRewards from './delete.controller';
import UpdateDailyRewards from './patch.controller';

const router = express.Router();

router.get('/', assertAssetPoolOwnership, ListDailyRewards.controller);
router.get(
    '/:id',
    assertRequestInput(ReadDailyRewards.validation),
    assertAssetPoolOwnership,
    ReadDailyRewards.controller,
);
router.post(
    '/',
    assertRequestInput(CreateDailyRewards.validation),
    assertAssetPoolOwnership,
    CreateDailyRewards.controller,
);
router.patch(
    '/:id',
    assertRequestInput(UpdateDailyRewards.validation),
    assertAssetPoolOwnership,
    UpdateDailyRewards.controller,
);
router.delete(
    '/:id',
    assertRequestInput(DeleteDailyRewards.validation),
    assertAssetPoolOwnership,
    DeleteDailyRewards.controller,
);

export default router;
