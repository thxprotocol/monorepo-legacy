import express from 'express';
import RouterTwitter from './twitter/twitter.router';

const router = express.Router({ mergeParams: true });

router.use('/twitter', RouterTwitter);

export default router;
