import express from 'express';
import { getAccount, getAccountByAddress, getAccountByEmail } from './get.action';
import { patchAccount } from './patch.action';
import { deleteAccount } from './delete.action';
import { validate } from '../../util/validate';
import { guard, validateJwt } from '../../middlewares';
import { getTwitter } from './twitter/get.action';
import { getLatestTweets } from './twitter/getLatestTweets.action';
import { getTwitterLike } from './twitter/getLike.action';
import { getTwitterRetweet } from './twitter/getRetweet.action';
import { getTwitterFollow } from './twitter/getFollow.action';
import { getYoutube } from './google/get.controller';
import { getYoutubeLike } from './google/youtube/like/get.controller';
import { getYoutubeSubscribe } from './google/youtube/subscribe/get.controller';
import { getDiscord } from './discord/get.action';
import { getDiscordGuildJoined } from './discord/guild/get.action';
import getByDiscordIdAction from './discord/getByDiscordId.action';
import { getTwitch } from './twitch/get.action';
import { getGithub } from './github/get.controller';
import { getShopify } from './shopify/get.action';
import { getShopifyOrderAmount } from './shopify/order-amount/get.controller';
import { getShopifyTotalSpent } from './shopify/total-spent/get.controller';
import { getShopifyPriceRules } from './shopify/price-rules/list.action';
import { createShopifyDiscountCode } from './shopify/discount-code/post.action';

import GetGoogleUser from './google/user/get.controller';
import GetTwitterUser from './twitter/user/get.controller';
import GetDiscordUser from './discord/user/get.controller';

const router = express.Router();

router.use(validateJwt);
router.get('/:sub', guard.check(['accounts:read']), getAccount);

router.get('/:sub/twitter', guard.check(['accounts:read']), getTwitter);
router.get('/:sub/twitter/tweets/latest', guard.check(['accounts:read']), getLatestTweets);
router.get('/:sub/twitter/user', guard.check(['accounts:read']), GetTwitterUser.controller);
router.get('/:sub/twitter/like/:item', guard.check(['accounts:read']), getTwitterLike);
router.get('/:sub/twitter/retweet/:item', guard.check(['accounts:read']), getTwitterRetweet);
router.get('/:sub/twitter/follow/:item', guard.check(['accounts:read']), getTwitterFollow);

router.get('/:sub/shopify', guard.check(['accounts:read']), getShopify);

router.get('/:sub/shopify/order-amount', guard.check(['accounts:read']), getShopifyOrderAmount);
router.get('/:sub/shopify/total-spent', guard.check(['accounts:read']), getShopifyTotalSpent);
router.get('/:sub/shopify/price-rules', guard.check(['accounts:read']), getShopifyPriceRules);
router.post('/:sub/shopify/discount-code', guard.check(['accounts:read']), createShopifyDiscountCode);

router.get('/:sub/google/youtube', guard.check(['accounts:read']), getYoutube);
router.get('/:sub/google/user', guard.check(['accounts:read']), GetGoogleUser.controller);
router.get('/:sub/google/youtube/like/:item', guard.check(['accounts:read']), getYoutubeLike);
router.get('/:sub/google/youtube/subscribe/:item', guard.check(['accounts:read']), getYoutubeSubscribe);

router.get('/:sub/discord', guard.check(['accounts:read']), getDiscord);
router.get('/:sub/discord/user', guard.check(['accounts:read']), GetDiscordUser.controller);
router.get('/:sub/discord/guild/:item', guard.check(['accounts:read']), getDiscordGuildJoined);

router.get('/:sub/twitch', guard.check(['accounts:read']), getTwitch);
router.get('/:sub/github', guard.check(['accounts:read']), getGithub);

router.get(
    '/discord/:discordId',
    guard.check(['accounts:read']),
    validate(getByDiscordIdAction.validation),
    getByDiscordIdAction.controller,
);
router.get('/address/:address', guard.check(['accounts:read']), validate([]), getAccountByAddress);
router.get('/email/:email', guard.check(['accounts:read']), validate([]), getAccountByEmail);
router.patch('/:sub', guard.check(['accounts:read', 'accounts:write']), patchAccount);
router.delete('/:sub', guard.check(['accounts:write']), deleteAccount);

export default router;
