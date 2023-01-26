import express from 'express';

import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadAccount from './get.controller';
import UpdateAccount from './patch.controller';
import DeleteAccount from './delete.controller';
import ReadAccountYoutube from './youtube/get.controller';
import ReadAccountTwitter from './twitter/get.controller';
import ReadAccountDiscord from './discord/get.controller';
import CreateAccountLogin from './login/post.controller';
import GetAccountByDiscordId from './discord/get.by-discord-id.controller';
import GetPointBalance from './discord/get.point-balance.controller';
import GetListERC20Tokens from './discord/get.list-erc20.controller'

const router = express.Router();

router.get('/', guard.check(['account:read']), ReadAccount.controller);
router.patch('/', guard.check(['account:read', 'account:write']), UpdateAccount.controller);
router.delete('/', guard.check(['account:write']), DeleteAccount.controller);

router.get('/twitter', guard.check(['account:read']), ReadAccountTwitter.controller);
router.get('/youtube', guard.check(['account:read']), ReadAccountYoutube.controller);
router.get('/discord', guard.check(['account:read']), ReadAccountDiscord.controller);

router.get(
    '/discord/:discordId',
    guard.check(['account:read']),
    assertRequestInput(GetAccountByDiscordId.validations),
    GetAccountByDiscordId.controller,
);

router.get('/:sub/discord/point_balance', guard.check(['account:read']), GetPointBalance.controller);
router.get('/:sub/discord/erc20/token', guard.check(['account:read']), GetListERC20Tokens.controller);
router.get('/:sub/discord/erc721/token', guard.check(['account:read']), GetListERC20Tokens.controller);

router.post(
    '/login',
    assertRequestInput(CreateAccountLogin.validation),
    guard.check(['account:write']),
    CreateAccountLogin.controller,
);

export default router;
