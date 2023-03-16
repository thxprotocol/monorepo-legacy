import express from 'express';
import { assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadAccount from './get.controller';
import UpdateAccount from './patch.controller';
import DeleteAccount from './delete.controller';
import ReadAccountYoutube from './youtube/get.controller';
import ReadAccountTwitter from './twitter/get.controller';
import ReadAccountDiscord from './discord/get.controller';
import GetAccountByDiscordId from './discord/get.by-discord-id.controller';
import GetPointBalance from './discord/get.point-balance.controller';
import GetListERC20Tokens from './discord/get.list-erc20.controller';
import GetListERC721Tokens from './discord/get.list-erc721.controller';
import ReadAccountShopify from './shopify/get.controller';
import CreateTwitterTweet from './twitter/tweet/post.controller';
import CreateTwitterUser from './twitter/user/post.controller';
import CreateTwitterUserByUsername from './twitter/user/by/username/post.controller';

const router = express.Router();

router.get('/', guard.check(['account:read']), ReadAccount.controller);
router.patch('/', guard.check(['account:read', 'account:write']), UpdateAccount.controller);
router.delete('/', guard.check(['account:write']), DeleteAccount.controller);

router.get('/twitter', guard.check(['account:read']), ReadAccountTwitter.controller);
router.get('/youtube', guard.check(['account:read']), ReadAccountYoutube.controller);
router.get('/discord', guard.check(['account:read']), ReadAccountDiscord.controller);
router.get('/shopify', guard.check(['account:read']), ReadAccountShopify.controller);

// router.post('/youtube/video', guard.check(['account:read']), CreateTwitterTweet.controller);
// router.post('/youtube/channel', guard.check(['account:read']), CreateTwitterTweet.controller);

router.get(
    '/discord/:discordId',
    guard.check(['account:read']),
    assertRequestInput(GetAccountByDiscordId.validations),
    GetAccountByDiscordId.controller,
);

router.get('/:sub/discord/point_balance', guard.check(['account:read']), GetPointBalance.controller);
router.get('/:sub/discord/erc20/token', guard.check(['account:read']), GetListERC20Tokens.controller);
router.get('/:sub/discord/erc721/token', guard.check(['account:read']), GetListERC721Tokens.controller);

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
