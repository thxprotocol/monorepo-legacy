import { assertAssetPoolOwnership, assertRequestInput, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPointRewards from './list.controller';
import ReadPointRewards from './get.controller';
import CreatePointRewards from './post.controller';
import DeletePointRewards from './delete.controller';
import UpdatePointRewards from './patch.controller';

const router = express.Router();

router.get('/', assertAssetPoolOwnership, requireAssetPoolHeader, ListPointRewards.controller);
router.get(
    '/:id',
    assertRequestInput(ReadPointRewards.validation),
    assertAssetPoolOwnership,
    requireAssetPoolHeader,
    ReadPointRewards.controller,
);
router.post(
    '/',
    assertRequestInput(CreatePointRewards.validation),
    assertAssetPoolOwnership,
    requireAssetPoolHeader,
    CreatePointRewards.controller,
);
router.patch(
    '/:id',
    assertRequestInput(UpdatePointRewards.validation),
    assertAssetPoolOwnership,
    requireAssetPoolHeader,
    UpdatePointRewards.controller,
);
router.delete(
    '/:id',
    assertRequestInput(DeletePointRewards.validation),
    assertAssetPoolOwnership,
    requireAssetPoolHeader,
    DeletePointRewards.controller,
);

export default router;
