import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';
import RouterAllowance from './allowance/allowance.router';
import RouterTransfer from './transfer/transfer.router';
import RouterBalance from './balance/balance.router';
import RouterPreview from './preview/preview.router';

import CreateController from './post.controller';
import ReadController from './get.controller';
import UpdateController from './patch.controller';
import DeleteController from './delete.controller';
import ListController from './list.controller';

import ListERC20Token from './token/list.controller';
import ReadERC20Token from './token/get.controller';
import ImportERC20 from './token/post.controller';

const router = express.Router();

router.use('/transfer', RouterTransfer);
router.use('/balance', RouterBalance);
router.use('/allowance', RouterAllowance);
router.use('/preview', RouterPreview);

// Token Resource should move into /wallet
router.get(
    '/token',
    guard.check(['erc20:read']),
    assertRequestInput(ListERC20Token.validation),
    ListERC20Token.controller,
);
router.get('/token/:id', guard.check(['erc20:read']), ReadERC20Token.controller);

// Should be /import controller
router.post(
    '/token',
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(ImportERC20.validation),
    ImportERC20.controller,
);
// End

router.post(
    '/',
    upload.single('file'),
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.get(
    '/:id',
    guard.check(['erc20:read']),
    assertRequestInput(ReadController.validation),
    ReadController.controller,
);
router.patch(
    '/:id',
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:id',
    guard.check(['erc20:write']),
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);
router.get('/', guard.check(['erc20:read']), assertRequestInput(ListController.validation), ListController.controller);

export default router;
