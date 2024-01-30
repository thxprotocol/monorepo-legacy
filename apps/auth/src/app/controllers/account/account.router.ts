import express from 'express';
import {
    getAccount,
    getAccountByAddress,
    getAccountByEmail,
    getMe,
    getAccounts,
    getAccountByDiscord,
} from './get.controller';
import Patch from './patch.controller';
import Delete from './delete.controller';
import { validate } from '../../util/validate';
import { guard, validateJwt } from '../../middlewares';

const router = express.Router();

router.use(validateJwt);
router.get('/', guard.check(['accounts:read']), getAccounts);
router.get('/me', guard.check(['account:read']), getMe);
router.get('/:sub', guard.check(['accounts:read']), getAccount);
router.patch('/:sub', guard.check(['accounts:read', 'accounts:write']), validate(Patch.validation), Patch.controller);
router.delete('/:sub', guard.check(['accounts:write']), validate(Delete.validation), Delete.controller);
router.get('/discord/:discordId', guard.check(['accounts:read']), validate([]), getAccountByDiscord);
router.get('/address/:address', guard.check(['accounts:read']), validate([]), getAccountByAddress);
router.get('/email/:email', guard.check(['accounts:read']), validate([]), getAccountByEmail);

export default router;
