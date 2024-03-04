import express from 'express';
import healthRouter from './health/health.router';
import accountRouter from './account/account.router';
import poolsRouter from './pools/pools.router';
import tokenRouter from './token/token.router';
import participantsRouter from './participants/participants.router';
import metadataRouter from './metadata/metadata.router';
import erc721Router from './erc721/erc721.router';
import erc1155Router from './erc1155/erc1155.router';
import uploadRouter from './upload/upload.router';
import erc20Router from './erc20/erc20.router';
import clientRouter from './client/client.router';
import claimsRouter from './claims/claims.router';
import brandsRouter from './brands/brands.router';
import widgetRouter from './widget/widget.router';
import questsRouter from './quests/quests.router';
import rewardsRouter from './rewards/rewards.router';
import leaderboardsRouter from './leaderboards/leaderboards.router';
import webhookRouter from './webhook/webhook.router';
import webhooksRouter from './webhooks/webhooks.router';
import widgetsRouter from './widgets/widgets.router';
import identityRouter from './identity/identity.router';
import eventsRouter from './events/events.router';
import dataRouter from './data/data.router';
import RouterVoteEscrow from './ve/ve.router';
import RouterJobs from './jobs/jobs.router';
import RouterCoupons from './coupons/coupons.router';
import { checkJwt, corsHandler } from '@thxnetwork/api/middlewares';

const router = express.Router({ mergeParams: true });

router.use('/ping', (_req, res) => res.send('pong'));
router.use('/health', healthRouter);
router.use('/data', dataRouter);
router.use('/token', tokenRouter);
router.use('/metadata', metadataRouter);
router.use('/brands', brandsRouter);
router.use('/widget', widgetRouter);
router.use('/leaderboards', leaderboardsRouter); // TODO Partial refactor
router.use('/qr-codes', claimsRouter);
router.use('/quests', questsRouter); // TODO Refactor
router.use('/rewards', rewardsRouter);
router.use('/webhook', webhookRouter);

router.use(checkJwt, corsHandler);
router.use('/jobs', RouterJobs);
router.use('/upload', uploadRouter);
router.use('/identity', identityRouter);
router.use('/events', eventsRouter);
router.use('/coupons', RouterCoupons);
router.use('/account', accountRouter);
router.use('/participants', participantsRouter);
router.use('/pools', poolsRouter);
router.use('/widgets', widgetsRouter);
router.use('/clients', clientRouter);
router.use('/webhooks', webhooksRouter);
router.use('/ve', RouterVoteEscrow);

router.use('/erc20', erc20Router);
router.use('/erc721', erc721Router);
router.use('/erc1155', erc1155Router);

// Below should move to /pools/:id/rewards CRUD
// router.use('/erc20-perks', erc20PerksRouter);
// router.use('/erc721-perks', erc721PerksRouter);
// router.use('/custom-rewards', customRewardsRouter);
// router.use('/coupon-rewards', couponRewardsRouter);
// router.use('/discord-role-rewards', discordRoleRewardsRouter);

export default router;
