import express from 'express';
import { guard } from '@thxnetwork/api/middlewares';
import ReadAccount from './get.controller';
import UpdateAccount from './patch.controller';
import DeleteAccount from './delete.controller';
import ReadAccountYoutube from './youtube/get.controller';
import ReadAccountTwitter from './twitter/get.controller';
import ReadAccountDiscord from './discord/get.controller';
import CreateTwitterTweet from './twitter/tweet/post.controller';
import CreateTwitterUser from './twitter/user/post.controller';

const router = express.Router();

router.get('/', guard.check(['account:read']), ReadAccount.controller);
router.patch('/', guard.check(['account:read', 'account:write']), UpdateAccount.controller);
router.delete('/', guard.check(['account:write']), DeleteAccount.controller);

router.get('/twitter', guard.check(['account:read']), ReadAccountTwitter.controller);
router.get('/youtube', guard.check(['account:read']), ReadAccountYoutube.controller);
router.get('/discord', guard.check(['account:read']), ReadAccountDiscord.controller);

// router.post('/youtube/video', guard.check(['account:read']), CreateTwitterTweet.controller);
// router.post('/youtube/channel', guard.check(['account:read']), CreateTwitterTweet.controller);

router.post('/twitter/tweet', guard.check(['account:read']), CreateTwitterTweet.controller);
router.post('/twitter/user', guard.check(['account:read']), CreateTwitterUser.controller);

export default router;
