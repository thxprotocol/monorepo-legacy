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
import { getSpotifyUserFollow, getSpotifyPlaylistFollow } from './spotify/get.follow.action';
import { getSpotifyTrackPlaying, getSpotifyTrackRecent, getSpotifyTrackSaved } from './spotify/get.track.action';
import { getSpotify } from './spotify/get.action';
import { createLoginValidation, postLogin } from './login/post.controller';

const router = express.Router();

router.use(validateJwt);
router.post('/', guard.check(['accounts:read', 'accounts:write']), validate(validations.postAccount), postAccount);
router.get('/:id', guard.check(['accounts:read']), getAccount);

router.get('/:sub/twitter', guard.check(['accounts:read']), getTwitter);
router.get('/:sub/twitter/like/:item', guard.check(['accounts:read']), getTwitterLike);
router.get('/:sub/twitter/retweet/:item', guard.check(['accounts:read']), getTwitterRetweet);
router.get('/:sub/twitter/follow/:item', guard.check(['accounts:read']), getTwitterFollow);

router.get('/:sub/google/youtube', guard.check(['accounts:read']), getYoutube);
router.get('/:sub/google/youtube/like/:item', guard.check(['accounts:read']), getYoutubeLike);
router.get('/:sub/google/youtube/subscribe/:item', guard.check(['accounts:read']), getYoutubeSubscribe);

router.get('/:sub/spotify', guard.check(['accounts:read']), getSpotify);
router.get('/:sub/spotify/user_follow/:item', guard.check(['accounts:read']), getSpotifyUserFollow);
router.get('/:sub/spotify/playlist_follow/:item', guard.check(['accounts:read']), getSpotifyPlaylistFollow);
router.get('/:sub/spotify/track_playing/:item', guard.check(['accounts:read']), getSpotifyTrackPlaying);
router.get('/:sub/spotify/track_recent/:item', guard.check(['accounts:read']), getSpotifyTrackRecent);
router.get('/:sub/spotify/track_saved/:item', guard.check(['accounts:read']), getSpotifyTrackSaved);

router.get('/address/:address', guard.check(['accounts:read']), validate([]), getAccountByAddress);
router.get('/email/:email', guard.check(['accounts:read']), validate([]), getAccountByEmail);
router.patch('/:id', guard.check(['accounts:read', 'accounts:write']), patchAccount);
router.delete('/:id', guard.check(['accounts:write']), deleteAccount);

router.post('/login', validate(createLoginValidation), guard.check(['accounts:write']), postLogin);

export default router;
