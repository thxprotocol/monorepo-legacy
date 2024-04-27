import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

import RouterWallet from './wallet/wallets.router';

// Account
import ReadAccount from './get.controller';
import UpdateAccount from './patch.controller';
import DeleteAccount from './delete.controller';

// Social OAuth
import CreateAccountDisconnect from './disconnect/post.controller';

import ReadAccountDiscord from './discord/get.controller';
import GetAccountByDiscordId from './discord/get.by-discord-id.controller';
import CreateTwitterTweet from './twitter/tweet/post.controller';
import CreateTwitterUser from './twitter/user/post.controller';
import CreateTwitterSearch from './twitter/search/post.controller';
import CreateTwitterUserByUsername from './twitter/user/by/username/post.controller';

const router = express.Router();

router.use('/wallets', RouterWallet);

router.get('/', guard.check(['account:read']), ReadAccount.controller);
router.patch('/', guard.check(['account:read', 'account:write']), UpdateAccount.controller);
router.delete('/', guard.check(['account:write']), DeleteAccount.controller);

router.post(
    '/disconnect',
    guard.check(['account:read', 'account:write']),
    assertRequestInput(CreateAccountDisconnect.validation),
    CreateAccountDisconnect.controller,
);

router.get('/discord', guard.check(['account:read']), ReadAccountDiscord.controller);
router.get(
    '/discord/:discordId',
    guard.check(['account:read']),
    assertRequestInput(GetAccountByDiscordId.validations),
    GetAccountByDiscordId.controller,
);
router.post(
    '/twitter/tweet',
    assertRequestInput(CreateTwitterTweet.validation),
    guard.check(['account:read']),
    CreateTwitterTweet.controller,
);
router.post(
    '/twitter/user/',
    assertRequestInput(CreateTwitterUser.validation),
    guard.check(['account:read']),
    CreateTwitterUser.controller,
);
router.post(
    '/twitter/search/',
    assertRequestInput(CreateTwitterSearch.validation),
    guard.check(['account:read']),
    CreateTwitterSearch.controller,
);
router.post(
    '/twitter/user/by/username',
    assertRequestInput(CreateTwitterUserByUsername.validation),
    guard.check(['account:read']),
    CreateTwitterUserByUsername.controller,
);

export default router;
