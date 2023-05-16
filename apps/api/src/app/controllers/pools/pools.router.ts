import express from 'express';
import {
    assertRequestInput,
    assertAssetPoolOwnership,
    guard,
    checkJwt,
    corsHandler,
} from '@thxnetwork/api/middlewares';
import CreatePool from './post.controller';
import ReadPool from './get.controller';
import PoolsAnalytics from './analytics/get.controller';
import PoolsAnalyticsLeaderBoard from './analytics/leaderboard/get.controller';
import PoolsAnalyticsLeaderBoardClient from './analytics/leaderboard/client/get.controller';
import PoolsAnalyticsMetrics from './analytics/metrics/get.controller';
import DeletePool from './delete.controller';
import ListPools from './list.controller';
import ListPoolsPublic from './public/list.controller';
import GetPoolsPublic from './public/get.controller';
import CreatePoolTopup from './topup/post.controller';
import ReadPoolTransfer from './transfers/get.controller';
import CreatePoolTransfer from './transfers/post.controller';
import DeletePoolTransfer from './transfers/delete.controller';
import CreatePoolSubscription from './subscriptions/post.controller';
import ReadPoolSubscription from './subscriptions/get.controller';
import DeletePoolSubscription from './subscriptions/delete.controller';
import CreatePoolTransferRefresh from './transfers/refresh/post.controller';
import ListPoolTransfer from './transfers/list.controller';
import UpdatePool from './patch.controller';

const router = express.Router();

router.post(
    '/',
    checkJwt,
    corsHandler,
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(CreatePool.validation),
    CreatePool.controller,
);
router.post(
    '/:id/transfers',
    checkJwt,
    corsHandler,
    guard.check(['pools:write']),
    assertRequestInput(CreatePoolTransfer.validation),
    CreatePoolTransfer.controller,
);
router.post(
    '/:id/subscription',
    checkJwt,
    corsHandler,
    guard.check(['pool_subscription:write']),
    assertRequestInput(CreatePoolSubscription.validation),
    CreatePoolSubscription.controller,
);
router.delete(
    '/:id/transfers',
    checkJwt,
    corsHandler,
    guard.check(['pools:write']),
    assertAssetPoolOwnership,
    assertRequestInput(DeletePoolTransfer.validation),
    DeletePoolTransfer.controller,
);
router.get('/:id/transfers/:token', assertRequestInput(ReadPoolTransfer.validation), ReadPoolTransfer.controller);
router.get(
    '/:id/transfers',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ListPoolTransfer.validation),
    ListPoolTransfer.controller,
);
router.post(
    '/:id/transfers/refresh',
    checkJwt,
    corsHandler,
    guard.check(['pools:write']),
    assertAssetPoolOwnership,
    assertRequestInput(CreatePoolTransferRefresh.validation),
    CreatePoolTransferRefresh.controller,
);
router.get('/', checkJwt, guard.check(['pools:read']), assertRequestInput(ListPools.validation), ListPools.controller);
router.get('/public', ListPoolsPublic.controller);
router.get('/public/:id', GetPoolsPublic.controller);
router.get(
    '/:id',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ReadPool.validation),
    ReadPool.controller,
);
router.get(
    '/:id/analytics',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertAssetPoolOwnership,
    assertRequestInput(PoolsAnalytics.validation),
    PoolsAnalytics.controller,
);
router.get(
    '/:id/analytics/leaderboard/client',
    checkJwt,
    corsHandler,
    guard.check(['pool_analytics:read']),
    //assertAssetPoolOwnership,
    assertRequestInput(PoolsAnalyticsLeaderBoardClient.validation),
    PoolsAnalyticsLeaderBoardClient.controller,
);
router.get(
    '/:id/analytics/leaderboard',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertAssetPoolOwnership,
    assertRequestInput(PoolsAnalyticsLeaderBoard.validation),
    PoolsAnalyticsLeaderBoard.controller,
);
router.get(
    '/:id/analytics/metrics',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertAssetPoolOwnership,
    assertRequestInput(PoolsAnalyticsMetrics.validation),
    PoolsAnalyticsMetrics.controller,
);
router.get(
    '/:id/subscription',
    checkJwt,
    corsHandler,
    guard.check(['pool_subscription:read']),
    assertRequestInput(ReadPoolSubscription.validation),
    ReadPoolSubscription.controller,
);
router.delete(
    '/:id',
    checkJwt,
    corsHandler,
    guard.check(['pools:write']),
    assertRequestInput(DeletePool.validation),
    DeletePool.controller,
);
router.delete(
    '/:id/subscription',
    checkJwt,
    corsHandler,
    guard.check(['pool_subscription:write']),
    assertRequestInput(DeletePoolSubscription.validation),
    DeletePoolSubscription.controller,
);
router.post(
    '/:id/topup',
    checkJwt,
    corsHandler,
    guard.check(['deposits:read', 'deposits:write']),
    assertAssetPoolOwnership,
    assertRequestInput(CreatePoolTopup.validation),
    CreatePoolTopup.controller,
);
router.patch(
    '/:id',
    checkJwt,
    corsHandler,
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(UpdatePool.validation),
    UpdatePool.controller,
);
export default router;
