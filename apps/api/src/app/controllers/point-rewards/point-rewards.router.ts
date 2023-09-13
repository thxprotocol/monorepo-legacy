import { assertPoolAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPointRewards from './list.controller';
import ReadPointRewards from './get.controller';
import CreatePointRewards from './post.controller';
import DeletePointRewards from './delete.controller';
import UpdatePointRewards from './patch.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get('/', assertPoolAccess, ListPointRewards.controller);
router.get(
    '/:id',
    assertRequestInput(ReadPointRewards.validation),
    // assertPoolAccess,
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
    assertRequestInput(UpdatePointRewards.validation),
    UpdatePointRewards.controller,
);
router.delete(
    '/:id',
    assertPoolAccess,
    assertRequestInput(DeletePointRewards.validation),
    DeletePointRewards.controller,
);

export default router;
