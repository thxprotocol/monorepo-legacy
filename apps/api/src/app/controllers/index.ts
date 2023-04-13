import express from 'express';
import healthRouter from './health/health.router';
import docsRouter from './docs/docs.router';
import accountRouter from './account/account.router';
import poolsRouter from './pools/pools.router';
import erc721PerksRouter from './erc721-perks/erc721-perks.router';
import referralRewardsRouter from './referral-rewards/referral-rewards.router';
import erc20PerksRouter from './erc20-perks/erc20-perks.router';
import shopifyPerksRouter from './shopify-perks/shopify-perks.router';
import tokenRouter from './token/token.router';
import pointRewardsRouter from './point-rewards/point-rewards.router';
import pointBalancesRouter from './point-balances/point-balances.router';
import metadataRouter from './erc721/metadata/metadata.router';
import erc721Router from './erc721/erc721.router';
import erc1155Router from './erc1155/erc1155.router';
import uploadRouter from './upload/upload.router';
import erc20Router from './erc20/erc20.router';
import clientRouter from './client/client.router';
import claimsRouter from './claims/claims.router';
import brandsRouter from './brands/brands.router';
import walletsRouter from './wallets/wallets.router';
import widgetRouter from './widget/widget.router';
import rewardsRouter from './rewards/rewards.router';
import perksRouter from './perks/perks.router';
import dailyRewardsRouter from './daily-rewards/daily-rewards.router';
import surveyRewardsRouter from './survey-rewards/survey-rewards.router';
import milestonesRewardRouter from './milestone-reward/milestone-rewards.router';
import merchantsRouter from './merchants/merchants.router';
import webhooksRouter from './webhooks/webhooks.router';
import widgetsRouter from './widgets/widgets.router';
import dataRouter from './data/data.router';
import { checkJwt, corsHandler } from '@thxnetwork/api/middlewares';

const router = express.Router();

router.use('/ping', (_req, res) => res.send('pong'));
router.use('/health', healthRouter);
router.use('/token', tokenRouter);
router.use('/docs', docsRouter);
router.use('/metadata', metadataRouter);
router.use('/widget', widgetRouter);
router.use('/rewards', rewardsRouter);
router.use('/perks', perksRouter);
router.use('/webhook', webhooksRouter);
router.use('/data', dataRouter);
router.use('/merchants', merchantsRouter);
router.use('/brands', brandsRouter);
router.use('/pools', poolsRouter);

router.use(checkJwt);
router.use(corsHandler);
router.use('/point-rewards', pointRewardsRouter);
router.use('/milestone-rewards', milestonesRewardRouter);
router.use('/daily-rewards', dailyRewardsRouter);
router.use('/survey-rewards', surveyRewardsRouter);
router.use('/point-balances', pointBalancesRouter);
router.use('/account', accountRouter);
router.use('/widgets', widgetsRouter);
router.use('/erc20', erc20Router);
router.use('/erc721', erc721Router);
router.use('/erc1155', erc1155Router);
router.use('/erc20-perks', erc20PerksRouter);
router.use('/erc721-perks', erc721PerksRouter);
router.use('/shopify-perks', shopifyPerksRouter);
router.use('/referral-rewards', referralRewardsRouter);
router.use('/upload', uploadRouter);
router.use('/clients', clientRouter);
router.use('/claims', claimsRouter);
router.use('/wallets', walletsRouter);

export default router;
