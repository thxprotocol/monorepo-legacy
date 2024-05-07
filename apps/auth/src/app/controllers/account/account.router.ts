import express from 'express';
import {
    getAccount,
    getAccountByAddress,
    getAccountByEmail,
    getAccountByDiscord,
    getAccountByIdentity,
} from './get.controller';
import Patch from './patch.controller';
import Delete from './delete.controller';
import List from './list.controller';
import TokenRead from './tokens/get.controller';
import TokenRemove from './tokens/delete.controller';
import { validate } from '../../util/validate';
import { guard, validateJwt } from '../../middlewares';

const router = express.Router({ mergeParams: true });

router.use(validateJwt);
router.get('/discord/:discordId', guard.check(['accounts:read']), validate([]), getAccountByDiscord);
router.get('/address/:address', guard.check(['accounts:read']), validate([]), getAccountByAddress);
router.get('/email/:email', guard.check(['accounts:read']), validate([]), getAccountByEmail);
router.get('/identity/:identity', guard.check(['accounts:read']), validate([]), getAccountByIdentity);

router.get('/:sub', guard.check(['accounts:read']), getAccount);
router.patch('/:sub', guard.check(['accounts:read', 'accounts:write']), validate(Patch.validation), Patch.controller);
router.delete('/:sub', guard.check(['accounts:write']), validate(Delete.validation), Delete.controller);
router.post('/', guard.check(['accounts:read']), validate(List.validation), List.controller);

router.get(
    '/:sub/tokens/:kind',
    guard.check(['accounts:read', 'accounts:write']),
    validate(TokenRead.validation),
    TokenRead.controller,
);

router.delete(
    '/:sub/tokens/:kind',
    guard.check(['accounts:read', 'accounts:write']),
    validate(TokenRemove.validation),
    TokenRemove.controller,
);

export default router;
