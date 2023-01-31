import express from 'express';
import { assertRequestInput, assertAssetPoolOwnership, guard } from '@thxnetwork/api/middlewares';
import CreatePool from './post.controller';
import ReadPool from './get.controller';
import PoolsAnalytics from './analytics/get.controller';
import PoolsAnalyticsLeaderBoard from './analytics/leaderboard/get.controller';
import PoolsAnalyticsMetrics from './analytics/metrics/get.controller';
import DeletePool from './delete.controller';
import ListPools from './list.controller';
import CreatePoolTopup from './topup/post.controller';
import UpdatePool from './patch.controller';

const router = express.Router();

router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(CreatePool.validation),
    CreatePool.controller,
);

router.get('/', guard.check(['pools:read']), assertRequestInput(ListPools.validation), ListPools.controller);
router.get('/:id', guard.check(['pools:read']), assertRequestInput(ReadPool.validation), ReadPool.controller);
router.get(
    '/:id/analytics',
    guard.check(['pools:read']),
    assertRequestInput(PoolsAnalytics.validation),
    PoolsAnalytics.controller,
);
router.get(
    '/:id/analytics/leaderboard',
    guard.check(['pools:read']),
    assertRequestInput(PoolsAnalyticsLeaderBoard.validation),
    PoolsAnalyticsLeaderBoard.controller,
);
router.get(
    '/:id/analytics/metrics',
    guard.check(['pools:read']),
    assertRequestInput(PoolsAnalyticsMetrics.validation),
    PoolsAnalyticsMetrics.controller,
);
router.delete('/:id', guard.check(['pools:write']), assertRequestInput(DeletePool.validation), DeletePool.controller);
router.post(
    '/:id/topup',
    guard.check(['deposits:read', 'deposits:write']),
    assertAssetPoolOwnership,
    assertRequestInput(CreatePoolTopup.validation),
    CreatePoolTopup.controller,
);
router.patch(
    '/:id',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(UpdatePool.validation),
    UpdatePool.controller,
);
export default router;
