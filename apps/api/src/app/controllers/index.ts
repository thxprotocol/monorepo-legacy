import express from 'express';
import healthRouter from './health/health.router';
import accountRouter from './account/account.router';
import poolsRouter from './pools/pools.router';
import erc721PerksRouter from './erc721-perks/erc721-perks.router';
import erc20PerksRouter from './erc20-perks/erc20-perks.router';
import customRewardsRouter from './custom-rewards/custom-rewards.router';
import couponRewardsRouter from './coupon-rewards/coupon-rewards.router';
import discordRoleRewardsRouter from './discord-role-rewards/discord-role-rewards.router';
import tokenRouter from './token/token.router';
import pointBalancesRouter from './point-balances/point-balances.router';
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
import webhooksRouter from './webhooks/webhooks.router';
import widgetsRouter from './widgets/widgets.router';
import identityRouter from './identity/identity.router';
import eventsRouter from './events/events.router';
import dataRouter from './data/data.router';
import RouterVoteEscrow from './ve/ve.router';
import RouterJobs from './jobs/jobs.router';
import { checkJwt, corsHandler } from '@thxnetwork/api/middlewares';

const router = express.Router({ mergeParams: true });

router.use('/ping', (_req, res) => res.send('pong'));
router.use('/health', healthRouter);
router.use('/data', dataRouter);
router.use('/token', tokenRouter);
router.use('/metadata', metadataRouter);
router.use('/brands', brandsRouter);
router.use('/claims', claimsRouter);
router.use('/widget', widgetRouter);
router.use('/leaderboards', leaderboardsRouter); // TODO Partial refactor
router.use('/quests', questsRouter); // TODO Refactor
router.use('/rewards', rewardsRouter); // TODO Refactor

router.use(checkJwt, corsHandler);
router.use('/jobs', RouterJobs);
router.use('/upload', uploadRouter);
router.use('/identity', identityRouter);
router.use('/events', eventsRouter);
router.use('/account', accountRouter);
router.use('/point-balances', pointBalancesRouter);
router.use('/pools', poolsRouter);
router.use('/widgets', widgetsRouter);
router.use('/clients', clientRouter);
router.use('/webhooks', webhooksRouter);
router.use('/ve', RouterVoteEscrow);

router.use('/erc20', erc20Router);
router.use('/erc721', erc721Router);
router.use('/erc1155', erc1155Router);

router.use('/erc20-perks', erc20PerksRouter);
router.use('/erc721-perks', erc721PerksRouter);
router.use('/custom-rewards', customRewardsRouter);
router.use('/coupon-rewards', couponRewardsRouter);
router.use('/discord-role-rewards', discordRoleRewardsRouter);

export default router;
