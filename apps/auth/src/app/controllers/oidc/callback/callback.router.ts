import express from 'express';
import ReadGoogle from './google/get.controller';
import ReadTwitter from './twitter/get.controller';
import ReadDiscord from './discord/get.controller';
import ReadGithub from './github/get.controller';
import ReadTwitch from './twitch/get.controller';

const router = express.Router();

router.get('/google', ReadGoogle.controller);
router.get('/twitter', ReadTwitter.controller);
router.get('/discord', ReadDiscord.controller);
router.get('/github', ReadGithub.controller);
router.get('/twitch', ReadTwitch.controller);

export default router;
