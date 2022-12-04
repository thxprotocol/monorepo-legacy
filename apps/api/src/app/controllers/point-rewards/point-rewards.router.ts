import { assertAssetPoolAccess, assertRequestInput, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPointRewards from './list.controller';
import ReadPointRewards from './get.controller';
import CreatePointRewards from './post.controller';
import DeletePointRewards from './delete.controller';
import UpdatePointRewards from './patch.controller';

const router = express.Router();

router.get('/', assertAssetPoolAccess, requireAssetPoolHeader, ListPointRewards.controller);
router.get(
    '/:id',
    assertRequestInput(ReadPointRewards.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    ReadPointRewards.controller,
);
router.post(
    '/',
    assertRequestInput(CreatePointRewards.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    CreatePointRewards.controller,
);
router.patch(
    '/:id',
    assertRequestInput(UpdatePointRewards.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    UpdatePointRewards.controller,
);
router.delete(
    '/:id',
    assertRequestInput(DeletePointRewards.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    DeletePointRewards.controller,
);

export default router;
