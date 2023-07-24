import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';
import ReadERC20 from './get.controller';
import ListERC20 from './list.controller';
import ListERC20Token from './token/list.controller';
import ReadERC20Token from './token/get.controller';
import CreateERC20 from './post.controller';
import ImportERC20 from './token/post.controller';
import DeleteERC20 from './delete.controller';
import UpdateERC20 from './patch.controller';
import PreviewERC20 from './import_preview/post.controller';
import CreateApproveERC20 from './approve/post.controller';
import CreateTransferERC20 from './transfer/post.controller';
import ReadTransferERC20 from './transfer/get.controller';
import ListTransferERC20 from './transfer/list.controller';
import ReadERC20Balance from './balance/get.controller';

const router = express.Router();

// Token Resource
router.get(
    '/token',
    guard.check(['erc20:read']),
    assertRequestInput(ListERC20Token.validation),
    ListERC20Token.controller,
);
router.get('/token/:id', guard.check(['erc20:read']), ReadERC20Token.controller);
router.post(
    '/token',
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(ImportERC20.validation),
    ImportERC20.controller,
);

// Transfer Resource
router.get(
    '/transfer',
    guard.check(['erc20:read']),
    ListTransferERC20.controller,
    assertRequestInput(ListTransferERC20.validation),
);
router.get('/transfer/:id', guard.check(['erc20:read']), ReadTransferERC20.controller);
router.post('/transfer', assertRequestInput(CreateTransferERC20.validation), CreateTransferERC20.controller);

// Approve Resource
router.post('/approve', assertRequestInput(CreateApproveERC20.validation), CreateApproveERC20.controller);

// ERC20 Resource
router.get('/', guard.check(['erc20:read']), assertRequestInput(ListERC20.validation), ListERC20.controller);
router.get('/:id', guard.check(['erc20:read']), assertRequestInput(ReadERC20.validation), ReadERC20.controller);
router.post(
    '/',
    upload.single('file'),
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(CreateERC20.validation),
    CreateERC20.controller,
);
router.patch(
    '/:id',
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(UpdateERC20.validation),
    UpdateERC20.controller,
);
router.delete('/:id', guard.check(['erc20:write']), assertRequestInput(DeleteERC20.validation), DeleteERC20.controller);

router.get(
    '/:id/balance/:address',
    guard.check(['erc20:read']),
    assertRequestInput(ReadERC20Balance.validation),
    ReadERC20Balance.controller,
);
router.post('/preview', assertRequestInput(PreviewERC20.validation), PreviewERC20.controller);

export default router;
