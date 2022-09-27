import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadERC20 from './get.controller';
import ListERC20 from './list.controller';
import ListERC20Token from './token/list.controller';
import ReadERC20Token from './token/get.controller';
import CreateERC20 from './post.controller';
import ImportERC20 from './token/post.controller';
import DeleteERC20 from './delete.controller';
import UpdateERC20 from './patch.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();

router.get('/token', guard.check(['erc20:read']), ListERC20Token.controller);
router.get('/token/:id', guard.check(['erc20:read']), ReadERC20Token.controller);
router.get('/', guard.check(['erc20:read']), assertRequestInput(ListERC20.validation), ListERC20.controller);
router.get('/:id', guard.check(['erc20:read']), assertRequestInput(ReadERC20.validation), ReadERC20.controller);
router.post(
    '/',
    upload.single('file'),
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(CreateERC20.validation),
    CreateERC20.controller,
);
router.post(
    '/token',
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(ImportERC20.validation),
    ImportERC20.controller,
);
router.patch(
    '/:id',
    guard.check(['erc20:write', 'erc20:read']),
    assertRequestInput(UpdateERC20.validation),
    UpdateERC20.controller,
);
router.delete('/:id', guard.check(['erc20:write']), assertRequestInput(DeleteERC20.validation), DeleteERC20.controller);

export default router;
