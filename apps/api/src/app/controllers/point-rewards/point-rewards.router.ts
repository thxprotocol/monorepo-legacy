import { assertAssetPoolOwnership, assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPointRewards from './list.controller';
import ReadPointRewards from './get.controller';
import CreatePointRewards from './post.controller';
import DeletePointRewards from './delete.controller';
import UpdatePointRewards from './patch.controller';
import { upload } from '@thxnetwork/api/util/multer';

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
    upload.single('file'),
    assertRequestInput(CreatePointRewards.validation),
    assertAssetPoolOwnership,
    CreatePointRewards.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    assertAssetPoolOwnership,
    assertRequestInput(UpdatePointRewards.validation),
    UpdatePointRewards.controller,
);
router.delete(
    '/:id',
    assertAssetPoolOwnership,
    assertRequestInput(DeletePointRewards.validation),
    DeletePointRewards.controller,
);

export default router;
