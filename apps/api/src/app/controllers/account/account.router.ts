import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';

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
import CreateTwitterUserByUsername from './twitter/user/by/username/post.controller';

// Wallet
import ReadAccountWallet from './wallet/list.controller';
import CreateWalletConfirm from './wallet/confirm/post.controller';

const router = express.Router();

router.get('/', guard.check(['account:read']), ReadAccount.controller);
router.patch('/', guard.check(['account:read', 'account:write']), UpdateAccount.controller);
router.delete('/', guard.check(['account:write']), DeleteAccount.controller);
router.get(
    '/wallet',
    guard.check(['account:read']),
    assertRequestInput(ReadAccountWallet.validation),
    ReadAccountWallet.controller,
);
router.post(
    '/wallet/confirm',
    guard.check(['account:read', 'account:write']),
    assertRequestInput(CreateWalletConfirm.validation),
    CreateWalletConfirm.controller,
);
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
    '/twitter/user/by/username',
    assertRequestInput(CreateTwitterUserByUsername.validation),
    guard.check(['account:read']),
    CreateTwitterUserByUsername.controller,
);

export default router;
