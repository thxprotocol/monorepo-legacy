import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';
import ListController from './list.controller';
// import UpdateController from './patch.controller';
// import CreateController from './post.controller';
// import RemoveController from './delete.controller';
import RouterRewardPayments from './payments/payments.router';

const router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['pools:read']),
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(ListController.validation),
    ListController.controller,
);
// router.post(
//     '/',
//     guard.check(['pools:read', 'pools:write']),
//     upload.single('file'),
//     assertPoolAccess,
//     assertRequestInput(CreateController.validation),
//     CreateController.controller,
// );
// router.patch(
//     '/:rewardId',
//     guard.check(['pools:read', 'pools:write']),
//     upload.single('file'),
//     assertPoolAccess,
//     assertRequestInput(UpdateController.validation),
//     UpdateController.controller,
// );
// router.delete(
//     '/:rewardId',
//     guard.check(['pools:read', 'pools:write']),
//     upload.single('file'),
//     assertPoolAccess,
//     assertRequestInput(RemoveController.validation),
//     RemoveController.controller,
// );

router.use('/:rewardId/payments', RouterRewardPayments);

export default router;
