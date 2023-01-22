import { assertAssetPoolOwnership, assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPointRewards from './list.controller';
import ReadPointRewards from './get.controller';
import CreatePointRewards from './post.controller';
import DeletePointRewards from './delete.controller';
import UpdatePointRewards from './patch.controller';

const router = express.Router();

router.get('/', assertAssetPoolOwnership, ListPointRewards.controller);
router.get(
    '/:id',
    assertRequestInput(ReadPointRewards.validation),
    // assertAssetPoolOwnership,
    ReadPointRewards.controller,
);
router.post(
    '/',
    assertRequestInput(CreatePointRewards.validation),
    assertAssetPoolOwnership,
    CreatePointRewards.controller,
);
router.patch(
    '/:id',
    assertRequestInput(UpdatePointRewards.validation),
    assertAssetPoolOwnership,
    UpdatePointRewards.controller,
);
router.delete(
    '/:id',
    assertRequestInput(DeletePointRewards.validation),
    assertAssetPoolOwnership,
    DeletePointRewards.controller,
);

export default router;
