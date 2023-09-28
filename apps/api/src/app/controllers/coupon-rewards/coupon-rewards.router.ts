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
    guard.check(['coupon_rewards:read']),
    assertPoolAccess,
    assertRequestInput(ListCustomReward.validation),
    ListCustomReward.controller,
);
router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['coupon_rewards:write', 'coupon_rewards:read']),
    assertPoolAccess,
    assertRequestInput(UpdateCustomReward.validation),
    UpdateCustomReward.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['coupon_rewards:write', 'coupon_rewards:read']),
    assertPoolAccess,
    assertRequestInput(CreateCustomReward.validation),
    CreateCustomReward.controller,
);
router.delete(
    '/:id',
    guard.check(['coupon_rewards:write']),
    assertPoolAccess,
    assertRequestInput(RemoveCustomReward.validation),
    RemoveCustomReward.controller,
);

export default router;
