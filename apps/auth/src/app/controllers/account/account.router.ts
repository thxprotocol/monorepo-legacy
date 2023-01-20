import express from 'express';
import { getAccount, getAccountByAddress, getAccountByEmail } from './get.action';
import { patchAccount } from './patch.action';
import { deleteAccount } from './delete.action';
import { postAccount } from './post.action';
import { validate } from '../../util/validate';
import { validations } from './_.validation';
import { guard, validateJwt } from '../../middlewares';
import { getTwitter } from './twitter/get.action';
import { getTwitterLike } from './twitter/getLike.action';
import { getTwitterRetweet } from './twitter/getRetweet.action';
import { getTwitterFollow } from './twitter/getFollow.action';
import { getYoutube } from './google/get.controller';
import { getYoutubeLike } from './google/youtube/like/get.controller';
import { getYoutubeSubscribe } from './google/youtube/subscribe/get.controller';
import { createLoginValidation, postLogin } from './login/post.controller';
import { getTwitch } from './twitch/get.action';
import { getDiscord } from './discord/get.action';
import { getDiscordGuildJoined } from './discord/guild/get.action';
import getByDiscordIdAction from './discord/getByDiscordId.action';

const router = express.Router();

router.use(validateJwt);
router.post('/', guard.check(['accounts:read', 'accounts:write']), validate(validations.postAccount), postAccount);
router.get('/:sub', guard.check(['accounts:read']), getAccount);

router.get('/:sub/twitter', guard.check(['accounts:read']), getTwitter);
router.get('/:sub/twitter/like/:item', guard.check(['accounts:read']), getTwitterLike);
router.get('/:sub/twitter/retweet/:item', guard.check(['accounts:read']), getTwitterRetweet);
router.get('/:sub/twitter/follow/:item', guard.check(['accounts:read']), getTwitterFollow);

router.get('/:sub/google/youtube', guard.check(['accounts:read']), getYoutube);
router.get('/:sub/google/youtube/like/:item', guard.check(['accounts:read']), getYoutubeLike);
router.get('/:sub/google/youtube/subscribe/:item', guard.check(['accounts:read']), getYoutubeSubscribe);

router.get('/:sub/discord', guard.check(['accounts:read']), getDiscord);
router.get('/:sub/discord/guild/:item', guard.check(['accounts:read']), getDiscordGuildJoined);

router.get('/:sub/twitch', guard.check(['accounts:read']), getTwitch);

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

router.post('/login', validate(createLoginValidation), guard.check(['accounts:write']), postLogin);

export default router;
